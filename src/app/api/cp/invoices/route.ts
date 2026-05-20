import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ensureSchema, getDb } from '@/lib/db';
import { getSession, PORTAL_COOKIE } from '@/lib/portal-auth';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendEmail, brandedTemplate } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const store = await cookies();
  const session = await getSession(store.get(PORTAL_COOKIE.cp)?.value);
  if (!session || session.portal !== 'cp') {
    return NextResponse.json({ ok: false, message: 'Sign in required.' }, { status: 401 });
  }

  await ensureSchema();
  const body = await req.json();
  const lead_id = Number(body.lead_id);
  const amount = Number(body.amount);
  const invoice_number = sanitizeText(body.invoice_number, 80);
  const notes = sanitizeText(body.notes || '', 1000);
  const invoice_doc_url = sanitizeText(body.invoice_doc_url, 500);

  if (!lead_id) return NextResponse.json({ ok: false, message: 'Lead is required.' }, { status: 400 });
  if (!amount || amount <= 0) return NextResponse.json({ ok: false, message: 'Valid amount required.' }, { status: 400 });
  if (!invoice_doc_url) return NextResponse.json({ ok: false, message: 'Invoice file required.' }, { status: 400 });

  const db = getDb();
  // Confirm lead belongs to this CP
  const lead = await db.execute({
    sql: `SELECT id, channel_partner_id, booking_id FROM leads WHERE id = ? LIMIT 1`,
    args: [lead_id],
  });
  const l = lead.rows[0] as any;
  if (!l || l.channel_partner_id !== session.userId) {
    return NextResponse.json({ ok: false, message: 'Lead not found.' }, { status: 404 });
  }

  await db.execute({
    sql: `INSERT INTO cp_invoices (channel_partner_id, lead_id, booking_id, invoice_number, amount, invoice_doc_url, notes, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')`,
    args: [
      session.userId, lead_id, l.booking_id || null,
      invoice_number, amount, invoice_doc_url, notes,
    ],
  });
  await audit('cp.invoice_submitted', { cp_id: session.userId, lead_id, amount });

  // Notify internal team
  void sendEmail({
    to: { email: process.env.EMAIL_FROM_ADDRESS || 'hello@flowrealty.in' },
    subject: `New CP invoice for review · ₹${amount.toLocaleString('en-IN')}`,
    html: brandedTemplate({
      heading: 'New CP invoice submitted',
      bodyHtml: `
        <p>CP <strong>${session.email}</strong> has submitted an invoice.</p>
        <p>Amount: ₹${amount.toLocaleString('en-IN')}</p>
        <p>Invoice file: <a href="${invoice_doc_url}">View</a></p>
        ${notes ? `<p>Notes: ${notes}</p>` : ''}
      `,
    }),
    tags: ['cp-invoice'],
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
