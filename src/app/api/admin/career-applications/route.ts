/**
 * Admin: list career applications submitted via /careers.
 *
 * Filter by status and role_interest. Returns CV URL so the admin can preview
 * the file straight from R2.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = new Set(['new', 'shortlisted', 'interviewing', 'hired', 'rejected']);

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();

  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const role = url.searchParams.get('role') || '';

  const where: string[] = ['1=1'];
  const args: (string | number)[] = [];
  if (status && ALLOWED_STATUSES.has(status)) {
    where.push('status = ?');
    args.push(status);
  }
  if (role) {
    where.push('role_interest = ?');
    args.push(role);
  }

  const r = await getDb().execute({
    sql: `SELECT id, reference_number, full_name, email, mobile, city, role_interest,
                 experience_years, current_company, current_role, linkedin_url, portfolio_url,
                 message, cv_url, cv_filename, source_page, status, notes, assigned_to,
                 created_at, updated_at
          FROM career_applications
          WHERE ${where.join(' AND ')}
          ORDER BY created_at DESC
          LIMIT 500`,
    args,
  });
  return NextResponse.json({ ok: true, applications: r.rows });
}
