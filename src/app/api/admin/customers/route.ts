import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT c.id, c.email, c.full_name, c.mobile, c.status, c.last_login_at, c.created_at,
           (SELECT COUNT(*) FROM customer_units cu WHERE cu.customer_id = c.id) AS units_count
    FROM customer_users c
    ORDER BY c.created_at DESC
  `);
  return NextResponse.json({ ok: true, customers: r.rows });
}

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json();
  const email = sanitizeText(body.email, 200).toLowerCase();
  const full_name = sanitizeText(body.full_name, 120);
  const mobile = sanitizeText(body.mobile, 10);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, message: 'Valid email required.' }, { status: 400 });
  if (full_name.length < 2)
    return NextResponse.json({ ok: false, message: 'Name required.' }, { status: 400 });

  try {
    const r = await getDb().execute({
      sql: `INSERT INTO customer_users (email, full_name, mobile, status) VALUES (?, ?, ?, 'active') RETURNING id`,
      args: [email, full_name, mobile],
    });
    const id = (r.rows[0] as any)?.id;
    await audit('admin.customer_created', { id, email });
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return NextResponse.json({ ok: false, message: 'A customer with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: 'Could not create customer.' }, { status: 500 });
  }
}
