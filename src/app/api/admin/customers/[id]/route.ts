import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id: idStr } = await params;
  const id = Number(idStr);
  const db = getDb();
  const [c, units, docs, notifs] = await Promise.all([
    db.execute({ sql: `SELECT * FROM customer_users WHERE id = ?`, args: [id] }),
    db.execute({
      sql: `SELECT cu.*, p.name AS project_name FROM customer_units cu LEFT JOIN projects p ON p.id = cu.project_id WHERE cu.customer_id = ? ORDER BY cu.id DESC`,
      args: [id],
    }),
    db.execute({ sql: `SELECT * FROM customer_documents WHERE customer_id = ? ORDER BY uploaded_at DESC`, args: [id] }),
    db.execute({ sql: `SELECT * FROM customer_notifications WHERE customer_id = ? ORDER BY created_at DESC`, args: [id] }),
  ]);
  if (c.rows.length === 0) return NextResponse.json({ ok: false, message: 'Not found.' }, { status: 404 });
  return NextResponse.json({
    ok: true,
    customer: c.rows[0],
    units: units.rows,
    documents: docs.rows,
    notifications: notifs.rows,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id: idStr } = await params;
  const id = Number(idStr);
  const body = await req.json();
  const updates: string[] = [];
  const args: (string | number)[] = [];
  if (body.full_name !== undefined) { updates.push('full_name = ?'); args.push(sanitizeText(body.full_name, 120)); }
  if (body.mobile !== undefined) { updates.push('mobile = ?'); args.push(sanitizeText(body.mobile, 10)); }
  if (body.status !== undefined) { updates.push('status = ?'); args.push(body.status === 'suspended' ? 'suspended' : 'active'); }
  if (updates.length === 0) return NextResponse.json({ ok: false, message: 'Nothing to update.' }, { status: 400 });
  args.push(id);
  await getDb().execute({ sql: `UPDATE customer_users SET ${updates.join(', ')} WHERE id = ?`, args });
  await audit('admin.customer_updated', { id });
  return NextResponse.json({ ok: true });
}
