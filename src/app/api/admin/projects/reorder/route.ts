import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { order } = (await req.json()) as { order: number[] };
  if (!Array.isArray(order)) {
    return NextResponse.json({ ok: false, message: 'Invalid payload' }, { status: 400 });
  }
  await ensureSchema();
  const db = getDb();
  await db.batch(
    order.map((id, i) => ({
      sql: 'UPDATE projects SET display_order = ? WHERE id = ?',
      args: [i + 1, id],
    })),
    'write'
  );
  await audit('admin.project_reorder', { order });
  return NextResponse.json({ ok: true });
}
