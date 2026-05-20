/**
 * Email-OTP authentication for the three portals: CP, Developer, Customer.
 *
 * Flow:
 *   1. User enters email
 *   2. Server checks the appropriate users table — if email isn't there or status != active,
 *      return a generic message (never reveal which emails exist)
 *   3. Server generates 6-digit code, hashes it, stores with 10-min expiry, emails plaintext via Brevo
 *   4. User enters code; server verifies hash, marks used, issues 30-day session token
 *
 * Sessions are stored server-side in `portal_sessions`, browser only stores the token in an
 * httpOnly cookie scoped to its portal.
 */
import crypto from 'node:crypto';
import { ensureSchema, getDb, rowsAs } from './db';
import { sendEmail, brandedTemplate } from './email';

export type Portal = 'cp' | 'developer' | 'customer';

const OTP_TTL_MIN = 10;
const SESSION_TTL_DAYS = 30;
const MAX_ATTEMPTS = 5;

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function makeCode(): string {
  // 6-digit numeric, leading zeros preserved
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Look up the user record for the given portal+email. Returns null when missing/inactive. */
export async function lookupUser(portal: Portal, email: string): Promise<{ id: number; full_name: string } | null> {
  await ensureSchema();
  const db = getDb();
  const lc = email.trim().toLowerCase();

  if (portal === 'cp') {
    const r = await db.execute({
      sql: `SELECT id, full_name FROM channel_partners WHERE LOWER(email) = ? AND status = 'approved' LIMIT 1`,
      args: [lc],
    });
    return rowsAs<{ id: number; full_name: string }>(r)[0] || null;
  }
  if (portal === 'developer') {
    const r = await db.execute({
      sql: `SELECT id, full_name FROM developer_users WHERE LOWER(email) = ? AND status = 'active' LIMIT 1`,
      args: [lc],
    });
    return rowsAs<{ id: number; full_name: string }>(r)[0] || null;
  }
  // customer
  const r = await db.execute({
    sql: `SELECT id, full_name FROM customer_users WHERE LOWER(email) = ? AND status = 'active' LIMIT 1`,
    args: [lc],
  });
  return rowsAs<{ id: number; full_name: string }>(r)[0] || null;
}

export async function issueOtp(args: {
  portal: Portal;
  email: string;
  ip?: string;
}): Promise<{ ok: boolean; message?: string }> {
  await ensureSchema();
  const db = getDb();
  const email = args.email.trim().toLowerCase();
  const user = await lookupUser(args.portal, email);

  // Always pretend success to avoid email enumeration; only send mail if user exists.
  if (user) {
    const code = makeCode();
    const codeHash = sha256(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000).toISOString();

    // Invalidate any older codes for the same email/portal
    await db.execute({
      sql: `UPDATE otp_codes SET used_at = datetime('now') WHERE email = ? AND portal = ? AND used_at IS NULL`,
      args: [email, args.portal],
    });

    await db.execute({
      sql: `INSERT INTO otp_codes (email, code_hash, portal, expires_at, ip_address) VALUES (?, ?, ?, ?, ?)`,
      args: [email, codeHash, args.portal, expiresAt, args.ip || ''],
    });

    const portalLabel =
      args.portal === 'cp' ? 'Channel Partner Portal' :
      args.portal === 'developer' ? 'Developer Portal' : 'Customer Portal';

    await sendEmail({
      to: { email, name: user.full_name },
      subject: `Your Flow Realty sign-in code: ${code}`,
      html: brandedTemplate({
        preheader: `Sign-in code for ${portalLabel}`,
        heading: 'Sign in to Flow Realty',
        bodyHtml: `
          <p>Use this 6-digit code to sign in to the ${portalLabel}. The code expires in ${OTP_TTL_MIN} minutes.</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#F5F5F5;background:rgba(255,255,255,0.04);padding:16px 24px;border-radius:14px;display:inline-block;margin-top:8px;">${code}</p>
          <p style="margin-top:24px;color:#6B6F78;">If you didn't request this, you can ignore the email.</p>
        `,
      }),
      tags: ['portal-otp', args.portal],
    }).catch(() => {});
  }

  return { ok: true, message: 'If your email is registered, you\'ll receive a 6-digit code shortly.' };
}

export async function verifyOtp(args: {
  portal: Portal;
  email: string;
  code: string;
  ip?: string;
}): Promise<{ ok: boolean; token?: string; userId?: number; message?: string }> {
  await ensureSchema();
  const db = getDb();
  const email = args.email.trim().toLowerCase();
  const codeHash = sha256(args.code.trim());

  const r = await db.execute({
    sql: `SELECT id, code_hash, attempts, expires_at, used_at FROM otp_codes
          WHERE email = ? AND portal = ? AND used_at IS NULL
          ORDER BY id DESC LIMIT 1`,
    args: [email, args.portal],
  });
  const row = rowsAs<{ id: number; code_hash: string; attempts: number; expires_at: string; used_at: string | null }>(r)[0];
  if (!row) return { ok: false, message: 'Invalid or expired code.' };
  if (row.used_at) return { ok: false, message: 'Code already used.' };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, message: 'Code expired.' };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, message: 'Too many attempts. Request a new code.' };

  if (row.code_hash !== codeHash) {
    await db.execute({
      sql: `UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?`,
      args: [row.id],
    });
    return { ok: false, message: 'Incorrect code.' };
  }

  // Code valid — get the user and create a session
  const user = await lookupUser(args.portal, email);
  if (!user) return { ok: false, message: 'Account not found.' };

  await db.execute({
    sql: `UPDATE otp_codes SET used_at = datetime('now') WHERE id = ?`,
    args: [row.id],
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000).toISOString();
  await db.execute({
    sql: `INSERT INTO portal_sessions (token, portal, user_id, email, expires_at, ip_address)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [token, args.portal, user.id, email, expiresAt, args.ip || ''],
  });
  await db.execute({
    sql: `DELETE FROM portal_sessions WHERE expires_at < datetime('now')`,
    args: [],
  });

  // Update last_login_at on the user
  if (args.portal === 'developer') {
    await db.execute({ sql: `UPDATE developer_users SET last_login_at = datetime('now') WHERE id = ?`, args: [user.id] });
  } else if (args.portal === 'customer') {
    await db.execute({ sql: `UPDATE customer_users SET last_login_at = datetime('now') WHERE id = ?`, args: [user.id] });
  }

  return { ok: true, token, userId: user.id };
}

export type PortalSession = {
  portal: Portal;
  userId: number;
  email: string;
};

export async function getSession(token: string | undefined | null): Promise<PortalSession | null> {
  if (!token) return null;
  await ensureSchema();
  const db = getDb();
  const r = await db.execute({
    sql: `SELECT portal, user_id, email FROM portal_sessions
          WHERE token = ? AND expires_at > datetime('now') LIMIT 1`,
    args: [token],
  });
  const row = rowsAs<{ portal: Portal; user_id: number; email: string }>(r)[0];
  if (!row) return null;
  return { portal: row.portal, userId: row.user_id, email: row.email };
}

export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  await getDb().execute({ sql: `DELETE FROM portal_sessions WHERE token = ?`, args: [token] });
}

export const PORTAL_COOKIE = {
  cp: 'fr_cp_session',
  developer: 'fr_dev_session',
  customer: 'fr_cust_session',
} as const;
