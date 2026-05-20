import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const status = new URL(req.url).searchParams.get('status') || '';
  const sql = status
    ? `SELECT * FROM channel_partners WHERE status = ? ORDER BY created_at DESC LIMIT 200`
    : `SELECT * FROM channel_partners ORDER BY created_at DESC LIMIT 200`;
  const r = await getDb().execute({ sql, args: status ? [status] : [] });
  return NextResponse.json({ ok: true, partners: r.rows });
}
