import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';
import { sendEmail, brandedTemplate } from '@/lib/email';

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
  let subject = '';
  let body_html = '';

  if (action === 'approve') {
    newStatus = 'approved';
    subject = 'You\'re approved · Flow Realty Bro Portal';
    body_html = `
      <p>Hi ${cp.full_name},</p>
      <p>Welcome to the Flow Realty Bro Portal. Your registration has been approved.</p>
      <p>Sign in any time at <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/bro-portal/login">our portal</a> using your registered email. We'll send a 6-digit code to sign you in.</p>
      <p>Once signed in, pick any project to register a lead. Our sales team takes it from there.</p>
    `;
  } else if (action === 'reject') {
    newStatus = 'rejected';
    subject = 'Your Flow Realty registration update';
    body_html = `
      <p>Hi ${cp.full_name},</p>
      <p>Thanks for registering with Flow Realty. Unfortunately we couldn't approve your registration at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>You're welcome to register again with corrected details.</p>
    `;
  } else if (action === 'suspend') {
    newStatus = 'suspended';
    subject = 'Your Flow Realty CP account has been suspended';
    body_html = `
      <p>Hi ${cp.full_name},</p>
      <p>Your CP account has been suspended.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Reach out to our team to resolve this.</p>
    `;
  } else if (action === 'activate') {
    newStatus = 'approved';
  } else {
    return NextResponse.json({ ok: false, message: 'Invalid action.' }, { status: 400 });
  }

  await db.execute({
    sql: `UPDATE channel_partners SET status = ?, rejection_reason = ?, approved_at = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [newStatus, action === 'reject' ? reason : '', newStatus === 'approved' ? new Date().toISOString() : null, id],
  });
  await audit('admin.cp_status_changed', { cp_id: id, action, new_status: newStatus });

  if (subject && body_html) {
    void sendEmail({
      to: { email: cp.email, name: cp.full_name },
      subject,
      html: brandedTemplate({
        heading: subject,
        bodyHtml: body_html,
        ...(newStatus === 'approved'
          ? { ctaLabel: 'Sign in to Bro Portal', ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/bro-portal/login` }
          : {}),
      }),
      tags: [`cp-${action}`],
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
