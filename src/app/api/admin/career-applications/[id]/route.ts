/**
 * Admin: update a career application — status, internal notes, recruiter
 * assignment.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = new Set([
  'new',
  'shortlisted',
  'interviewing',
  'hired',
  'rejected',
]);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id)
    return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 });

  await ensureSchema();
  const db = getDb();

  const cur = await db.execute({
    sql: `SELECT * FROM career_applications WHERE id = ? LIMIT 1`,
    args: [id],
  });
  if (cur.rows.length === 0)
    return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
  const row = cur.rows[0] as Record<string, unknown>;

  const body = await req.json();

  let status = String(row.status || 'new');
  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.has(body.status))
      return NextResponse.json(
        { ok: false, message: 'Invalid status.' },
        { status: 400 }
      );
    status = body.status;
  }

  const notes =
    body.notes !== undefined
      ? sanitizeText(body.notes, 4000)
      : String(row.notes || '');
  const assigned_to =
    body.assigned_to !== undefined
      ? sanitizeText(body.assigned_to, 200)
      : String(row.assigned_to || '');

  await db.execute({
    sql: `UPDATE career_applications
          SET status = ?, notes = ?, assigned_to = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [status, notes, assigned_to, id],
  });

  await audit('career.updated', { id, status, assigned_to });
  return NextResponse.json({ ok: true });
}
