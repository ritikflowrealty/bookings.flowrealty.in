import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const source = url.searchParams.get('source') || '';

  const where: string[] = ['1=1'];
  const args: (string | number)[] = [];
  if (status) {
    where.push('l.status = ?');
    args.push(status);
  }
  if (source) {
    where.push('l.source = ?');
    args.push(source);
  }

  const r = await getDb().execute({
    sql: `SELECT l.*,
                 p.name AS project_name,
                 cp.full_name AS cp_name,
                 cp.email AS cp_email
          FROM leads l
          LEFT JOIN projects p ON p.id = l.project_id
          LEFT JOIN channel_partners cp ON cp.id = l.channel_partner_id
          WHERE ${where.join(' AND ')}
          ORDER BY l.created_at DESC
          LIMIT 200`,
    args,
  });
  return NextResponse.json({ ok: true, leads: r.rows });
}
