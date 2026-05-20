import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = ['under_review', 'approved', 'paid', 'rejected'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id.' }, { status: 400 });

  const body = await req.json();
  const status = ALLOWED.includes(body.status) ? body.status : null;
  if (!status) return NextResponse.json({ ok: false, message: 'Invalid status.' }, { status: 400 });
  const notes = sanitizeText(body.notes || '', 1000);

  const db = getDb();
  await db.execute({
    sql: `UPDATE cp_invoices SET
            status = ?,
            notes = COALESCE(NULLIF(?, ''), notes),
            reviewed_by = 'admin',
            reviewed_at = datetime('now'),
            paid_at = CASE WHEN ? = 'paid' THEN datetime('now') ELSE paid_at END
          WHERE id = ?`,
    args: [status, notes, status, id],
  });
  await audit('admin.invoice_status', { id, status });

  // Push the CP
  const cpRow = await db.execute({
    sql: `SELECT i.channel_partner_id, i.amount FROM cp_invoices i WHERE i.id = ?`,
    args: [id],
  });
  const cp = cpRow.rows[0] as any;
  if (cp) {
    void sendToCustomerOrAdmin('cp', cp.channel_partner_id, {
      title: `Invoice ${status.replace('_', ' ')}`,
      body: `₹${Number(cp.amount).toLocaleString('en-IN')} · ${notes || ''}`.trim(),
      url: '/bro-portal/invoices',
      tag: `invoice-${status}`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
