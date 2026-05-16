import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const db = getDb();
  const totalProjects = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number }).c;
  const visibleProjects = (
    db.prepare('SELECT COUNT(*) as c FROM projects WHERE is_visible = 1').get() as { c: number }
  ).c;
  const bookingOpen = (
    db.prepare('SELECT COUNT(*) as c FROM projects WHERE booking_enabled = 1').get() as {
      c: number;
    }
  ).c;
  const paymentActive = (
    db.prepare('SELECT COUNT(*) as c FROM projects WHERE payment_enabled = 1').get() as {
      c: number;
    }
  ).c;
  const totalBookings = (db.prepare('SELECT COUNT(*) as c FROM bookings').get() as { c: number }).c;
  const paidBookings = (
    db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'paid'").get() as { c: number }
  ).c;
  const revenue = (
    db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM bookings WHERE status = 'paid'").get() as {
      s: number;
    }
  ).s;

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
