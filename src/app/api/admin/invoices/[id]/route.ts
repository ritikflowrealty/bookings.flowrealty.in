import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendEmail, brandedTemplate } from '@/lib/email';

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

  // Email CP
  const cpRow = await db.execute({
    sql: `SELECT cp.email, cp.full_name, i.amount FROM cp_invoices i
          JOIN channel_partners cp ON cp.id = i.channel_partner_id WHERE i.id = ?`,
    args: [id],
  });
  const cp = cpRow.rows[0] as any;
  if (cp) {
    void sendEmail({
      to: { email: cp.email, name: cp.full_name },
      subject: `Your invoice is now ${status.replace('_', ' ')}`,
      html: brandedTemplate({
        heading: `Invoice ${status.replace('_', ' ')}`,
        bodyHtml: `
          <p>Hi ${cp.full_name},</p>
          <p>Your invoice for ₹${Number(cp.amount).toLocaleString('en-IN')} is now <strong>${status.replace('_', ' ')}</strong>.</p>
          ${notes ? `<p>Notes: ${notes}</p>` : ''}
        `,
      }),
      tags: [`invoice-${status}`],
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
