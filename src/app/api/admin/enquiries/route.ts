/**
 * Admin: list public Enquire Now submissions.
 *
 * Filterable by audience (buyer / developer / cp) and status.
 * Read-only for now — status updates can be wired in later if needed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_AUDIENCES = new Set(['buyer', 'developer', 'cp']);
const ALLOWED_STATUSES = new Set(['new', 'contacted', 'closed']);

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();

  const url = new URL(req.url);
  const audience = url.searchParams.get('audience') || '';
  const status = url.searchParams.get('status') || '';

  const where: string[] = ['1=1'];
  const args: (string | number)[] = [];
  if (audience && ALLOWED_AUDIENCES.has(audience)) {
    where.push('audience = ?');
    args.push(audience);
  }
  if (status && ALLOWED_STATUSES.has(status)) {
    where.push('status = ?');
    args.push(status);
  }

  const r = await getDb().execute({
    sql: `SELECT id, audience, full_name, email, mobile, city, configuration, budget_range,
                 message, source_page, company_name, designation, project_name, unit_count,
                 rera_number, status, created_at
          FROM enquiries
          WHERE ${where.join(' AND ')}
          ORDER BY created_at DESC
          LIMIT 500`,
    args,
  });
  return NextResponse.json({ ok: true, enquiries: r.rows });
}
