import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id.' }, { status: 400 });
  const { action } = await req.json();
  const newStatus = action === 'suspend' ? 'suspended' : 'active';
  await getDb().execute({
    sql: `UPDATE developer_users SET status = ? WHERE id = ?`,
    args: [newStatus, id],
  });
  await audit('admin.developer_user_status', { id, status: newStatus });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id.' }, { status: 400 });
  await getDb().execute({
    sql: `DELETE FROM developer_users WHERE id = ?`,
    args: [id],
  });
  await audit('admin.developer_user_deleted', { id });
  return NextResponse.json({ ok: true });
}
