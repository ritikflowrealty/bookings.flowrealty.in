import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureSchema, getDb } from '@/lib/db';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.cpId) {
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
  const lead = await db.execute({
    sql: `SELECT id, channel_partner_id, booking_id FROM leads WHERE id = ? LIMIT 1`,
    args: [lead_id],
  });
  const l = lead.rows[0] as any;
  if (!l || l.channel_partner_id !== session.cpId) {
    return NextResponse.json({ ok: false, message: 'Lead not found.' }, { status: 404 });
  }

  await db.execute({
    sql: `INSERT INTO cp_invoices (channel_partner_id, lead_id, booking_id, invoice_number, amount, invoice_doc_url, notes, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')`,
    args: [session.cpId, lead_id, l.booking_id || null, invoice_number, amount, invoice_doc_url, notes],
  });
  await audit('cp.invoice_submitted', { cp_id: session.cpId, lead_id, amount });

  void sendToCustomerOrAdmin('admin', null, {
    title: `New CP invoice · ₹${amount.toLocaleString('en-IN')}`,
    body: `From ${session.user?.email}`,
    url: '/admin',
    tag: 'invoice-new',
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
