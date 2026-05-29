import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureSchema, getDb } from '@/lib/db';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';
import { notifyGallabox, buildUsRecipients } from '@/lib/gallabox';
import { getProjectById } from '@/lib/projects';
import { getSettings, setting } from '@/lib/settings';

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
    sql: `SELECT id, channel_partner_id, booking_id, project_id FROM leads WHERE id = ? LIMIT 1`,
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

  // WhatsApp via Gallabox — developer + submitting CP + us
  void (async () => {
    try {
      if (!l.project_id) return;
      const project = await getProjectById(l.project_id);
      if (!project) return;
      const cpId = session.cpId;
      if (!cpId) return;
      const cpRow = await db.execute({
        sql: `SELECT full_name, mobile FROM channel_partners WHERE id = ? LIMIT 1`,
        args: [cpId],
      });
      const cp = cpRow.rows[0] as any;
      if (!cp) return;
      const s = await getSettings();
      const us = buildUsRecipients(setting(s, 'internal_whatsapp_numbers', ''));
      await notifyGallabox({
        project,
        event: {
          event: 'invoice.submitted',
          title: 'New CP invoice',
          data: {
            invoice_number,
            amount,
            cp_name: cp.full_name,
            cp_phone: cp.mobile || '',
            invoice_doc_url,
            notes,
          },
        },
        recipients: [
          { role: 'developer', phone: project.developer_whatsapp, name: project.developer },
          { role: 'cp', phone: cp.mobile || '', name: cp.full_name },
          ...us,
        ],
      });
    } catch (err: any) {
      console.error('[gallabox] invoice.submitted notify failed:', err?.message || err);
    }
  })();

  return NextResponse.json({ ok: true });
}
