import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['new', 'contacted', 'qualified', 'site_visit', 'booked', 'lost'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id.' }, { status: 400 });

  const body = await req.json();
  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ ok: false, message: 'Invalid status.' }, { status: 400 });
    }
    updates.push('status = ?');
    args.push(body.status);
  }
  if (body.assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    args.push(sanitizeText(body.assigned_to, 200));
  }
  if (body.notes !== undefined) {
    updates.push('notes = ?');
    args.push(sanitizeText(body.notes, 2000));
  }
  if (body.lost_reason !== undefined) {
    updates.push('lost_reason = ?');
    args.push(sanitizeText(body.lost_reason, 500));
  }
  if (body.walkin_date !== undefined) {
    updates.push('walkin_date = ?');
    args.push(body.walkin_date || null);
  }
  if (updates.length === 0) {
    return NextResponse.json({ ok: false, message: 'Nothing to update.' }, { status: 400 });
  }
  updates.push(`updated_at = datetime('now')`);
  args.push(id);

  await getDb().execute({
    sql: `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  // If status moved to 'site_visit' or 'booked', auto-record a walkin
  if (body.status === 'site_visit' || body.status === 'booked') {
    const lead = await getDb().execute({
      sql: `SELECT project_id, channel_partner_id FROM leads WHERE id = ?`,
      args: [id],
    });
    const l = lead.rows[0] as any;
    if (l?.project_id) {
      await getDb().execute({
        sql: `INSERT INTO walkins (project_id, lead_id, channel_partner_id, walkin_date)
              VALUES (?, ?, ?, datetime('now'))`,
        args: [l.project_id, id, l.channel_partner_id || null],
      });
    }
  }

  await audit('admin.lead_updated', { id, updates: Object.keys(body) });
  return NextResponse.json({ ok: true });
}
