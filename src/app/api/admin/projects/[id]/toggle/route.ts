import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb, type ProjectRow } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['is_visible', 'booking_enabled', 'payment_enabled']);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 });

  const { field, value } = await req.json();
  if (!ALLOWED.has(field)) {
    return NextResponse.json({ ok: false, message: 'Bad field.' }, { status: 400 });
  }
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as ProjectRow | undefined;
  if (!row) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });

  const newVal = value ? 1 : 0;
  if (
    (field === 'booking_enabled' || field === 'payment_enabled') &&
    newVal === 1
  ) {
    const provider = row.payment_provider || 'razorpay';
    if (provider === 'razorpay' && !row.razorpay_active) {
      return NextResponse.json(
        { ok: false, message: 'Configure Razorpay key and secret first.' },
        { status: 400 }
      );
    }
    if (provider === 'cashfree' && !row.cashfree_active) {
      return NextResponse.json(
        { ok: false, message: 'Configure Cashfree App ID and Secret first.' },
        { status: 400 }
      );
    }
    if (provider === 'payu' && !(row as any).payu_active) {
      return NextResponse.json(
        { ok: false, message: 'Configure PayU Merchant Key and Salt first.' },
        { status: 400 }
      );
    }
  }

  await db.execute({
    sql: `UPDATE projects SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [newVal, id],
  });
  await audit('admin.project_toggle', { id, field, value: newVal });
  return NextResponse.json({ ok: true });
}
