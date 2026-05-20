import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendToCustomerOrAdmin } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ ok: false, message: 'Invalid id.' }, { status: 400 });

  const body = await req.json();
  const action = body.action as 'approve' | 'reject' | 'suspend' | 'activate';
  const reason = sanitizeText(body.reason || '', 500);

  const db = getDb();
  const r = await db.execute({
    sql: `SELECT id, full_name, email, status FROM channel_partners WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const cp = r.rows[0] as any;
  if (!cp) return NextResponse.json({ ok: false, message: 'Not found.' }, { status: 404 });

  let newStatus: string;
  let pushTitle = '';
  let pushBody = '';

  if (action === 'approve') {
    newStatus = 'approved';
    pushTitle = 'Your CP registration is approved';
    pushBody = 'You can now sign in to the Bro Portal.';
  } else if (action === 'reject') {
    newStatus = 'rejected';
    pushTitle = 'CP registration update';
    pushBody = reason || 'Your registration was not approved.';
  } else if (action === 'suspend') {
    newStatus = 'suspended';
    pushTitle = 'CP account suspended';
    pushBody = reason || 'Reach out to our team to resolve this.';
  } else if (action === 'activate') {
    newStatus = 'approved';
    pushTitle = 'CP account reactivated';
    pushBody = 'You can sign in again.';
  } else {
    return NextResponse.json({ ok: false, message: 'Invalid action.' }, { status: 400 });
  }

  await db.execute({
    sql: `UPDATE channel_partners SET status = ?, rejection_reason = ?, approved_at = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [newStatus, action === 'reject' ? reason : '', newStatus === 'approved' ? new Date().toISOString() : null, id],
  });
  await audit('admin.cp_status_changed', { cp_id: id, action, new_status: newStatus });

  // Push the CP if they have notifications enabled
  void sendToCustomerOrAdmin('cp', id, {
    title: pushTitle,
    body: pushBody,
    url: '/bro-portal/dashboard',
    tag: `cp-${action}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
