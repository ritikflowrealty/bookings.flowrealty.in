/**
 * Admin: update an enquiry's status (new → contacted → closed).
 */
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = new Set(['new', 'contacted', 'closed']);

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
  const body = await req.json();
  const status = String(body.status || '');
  if (!ALLOWED_STATUSES.has(status))
    return NextResponse.json(
      { ok: false, message: 'Invalid status.' },
      { status: 400 }
    );

  await getDb().execute({
    sql: `UPDATE enquiries SET status = ? WHERE id = ?`,
    args: [status, id],
  });

  await audit('enquiry.status_changed', { id, status });
  return NextResponse.json({ ok: true });
}
