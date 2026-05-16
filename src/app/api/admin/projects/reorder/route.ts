import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const { order } = (await req.json()) as { order: number[] };
  if (!Array.isArray(order)) {
    return NextResponse.json({ ok: false, message: 'Invalid payload' }, { status: 400 });
  }
  const db = getDb();
  const stmt = db.prepare('UPDATE projects SET display_order = ? WHERE id = ?');
  const tx = db.transaction((ids: number[]) => {
    ids.forEach((id, i) => stmt.run(i + 1, id));
  });
  tx(order);
  audit('admin.project_reorder', { order });
  return NextResponse.json({ ok: true });
}
