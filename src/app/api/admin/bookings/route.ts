import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.*, p.name as project_name, p.developer as project_developer
       FROM bookings b LEFT JOIN projects p ON p.id = b.project_id
       ORDER BY b.id DESC LIMIT 200`
    )
    .all();
  return NextResponse.json({ ok: true, bookings: rows });
}
