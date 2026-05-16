import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function scalar(sql: string): Promise<number> {
  const r = await getDb().execute(sql);
  const row = (r.rows[0] as Record<string, unknown>) || {};
  const key = Object.keys(row)[0];
  return Number(row[key] ?? 0);
}

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();

  const [
    totalProjects,
    visibleProjects,
    bookingOpen,
    paymentActive,
    totalBookings,
    paidBookings,
    revenue,
  ] = await Promise.all([
    scalar('SELECT COUNT(*) as c FROM projects'),
    scalar('SELECT COUNT(*) as c FROM projects WHERE is_visible = 1'),
    scalar('SELECT COUNT(*) as c FROM projects WHERE booking_enabled = 1'),
    scalar('SELECT COUNT(*) as c FROM projects WHERE payment_enabled = 1'),
    scalar('SELECT COUNT(*) as c FROM bookings'),
    scalar("SELECT COUNT(*) as c FROM bookings WHERE status = 'paid'"),
    scalar("SELECT COALESCE(SUM(amount),0) as s FROM bookings WHERE status = 'paid'"),
  ]);

  return NextResponse.json({
    ok: true,
    stats: {
      totalProjects,
      visibleProjects,
      bookingOpen,
      paymentActive,
      totalBookings,
      paidBookings,
      revenue,
    },
  });
}
