import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const result = await getDb().execute(
    `SELECT b.*, p.name as project_name, p.developer as project_developer
     FROM bookings b LEFT JOIN projects p ON p.id = b.project_id
     ORDER BY b.id DESC LIMIT 200`
  );
  return NextResponse.json({ ok: true, bookings: result.rows });
}
