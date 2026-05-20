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
    SELECT du.id, du.email, du.full_name, du.role, du.status, du.developer_id, du.last_login_at, du.created_at,
           d.name AS developer_name
    FROM developer_users du
    JOIN developers d ON d.id = du.developer_id
    ORDER BY du.created_at DESC
  `);
  return NextResponse.json({ ok: true, users: r.rows });
}

export async function POST(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = await req.json();
  const email = sanitizeText(body.email, 200).toLowerCase();
  const full_name = sanitizeText(body.full_name, 120);
  const role = ['viewer', 'manager', 'admin'].includes(body.role) ? body.role : 'viewer';
  const developer_id = Number(body.developer_id);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ ok: false, message: 'Valid email required.' }, { status: 400 });
  if (full_name.length < 2)
    return NextResponse.json({ ok: false, message: 'Name required.' }, { status: 400 });
  if (!developer_id)
    return NextResponse.json({ ok: false, message: 'Developer required.' }, { status: 400 });

  const db = getDb();
  const dev = await db.execute({
    sql: `SELECT name FROM developers WHERE id = ? LIMIT 1`,
    args: [developer_id],
  });
  if (dev.rows.length === 0)
    return NextResponse.json({ ok: false, message: 'Developer not found.' }, { status: 404 });

  try {
    await db.execute({
      sql: `INSERT INTO developer_users (email, full_name, developer_id, role, status)
            VALUES (?, ?, ?, ?, 'active')`,
      args: [email, full_name, developer_id, role],
    });
    await audit('admin.developer_user_invited', { email, developer_id, role });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      return NextResponse.json({ ok: false, message: 'This email is already invited.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: 'Could not invite user.' }, { status: 500 });
  }
}
