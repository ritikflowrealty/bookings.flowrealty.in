import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['is_visible', 'booking_enabled', 'payment_enabled']);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 });

  const { field, value } = await req.json();
  if (!ALLOWED.has(field)) {
    return NextResponse.json({ ok: false, message: 'Bad field.' }, { status: 400 });
  }
  const db = getDb();
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!row) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });

  const newVal = value ? 1 : 0;
  if (
    (field === 'booking_enabled' || field === 'payment_enabled') &&
    newVal === 1 &&
    !row.razorpay_active
  ) {
    return NextResponse.json(
      { ok: false, message: 'Configure Razorpay key and secret first.' },
      { status: 400 }
    );
  }

  db.prepare(`UPDATE projects SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`).run(
    newVal,
    id
  );
  audit('admin.project_toggle', { id, field, value: newVal });
  return NextResponse.json({ ok: true });
}
