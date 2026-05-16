/**
 * Server-only admin auth.
 * Password lives in process.env.ADMIN_PASSWORD and is NEVER sent to the client.
 * Sessions are random tokens stored in admin_sessions table with 24h expiry.
 */
import crypto from 'node:crypto';
import { ensureSchema, getDb } from './db';

const SESSION_TTL_HOURS = 24;
const PUBLIC_PASSWORD_HINT = 'Set ADMIN_PASSWORD in your environment.';

function expectedPassword(): string {
  return process.env.ADMIN_PASSWORD || 'FlowRealty2026!';
}

/**
 * Constant-time comparison to mitigate timing attacks.
 */
export function verifyPassword(input: string): boolean {
  const expected = expectedPassword();
  const a = Buffer.from(input || '', 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    crypto.timingSafeEqual(Buffer.alloc(b.length), Buffer.alloc(b.length));
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export async function createSession(ipAddress = ''): Promise<{ token: string; expiresAt: string }> {
  await ensureSchema();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();

  const db = getDb();
  await db.execute({
    sql: `INSERT INTO admin_sessions (token, expires_at, ip_address) VALUES (?, ?, ?)`,
    args: [token, expiresAt, ipAddress],
  });

  // Garbage-collect expired sessions opportunistically
  await db.execute(`DELETE FROM admin_sessions WHERE expires_at < datetime('now')`);

  return { token, expiresAt };
}

export async function isValidSession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')`,
    args: [token],
  });
  return result.rows.length > 0;
}

export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  const db = getDb();
  await db.execute({
    sql: `DELETE FROM admin_sessions WHERE token = ?`,
    args: [token],
  });
}

/**
 * Reads the bearer token from an Authorization header.
 */
export function bearerFromHeader(headerValue: string | null | undefined): string | null {
  if (!headerValue) return null;
  const m = headerValue.match(/^Bearer\s+([A-Za-z0-9._-]+)$/);
  return m ? m[1] : null;
}

export const passwordHint = PUBLIC_PASSWORD_HINT;
