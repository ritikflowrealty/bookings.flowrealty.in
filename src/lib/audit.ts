import { getDb } from './db';

export function audit(
  action: string,
  details: Record<string, unknown> = {},
  meta: { actor?: string; ip?: string; ua?: string } = {}
) {
  try {
    getDb()
      .prepare(
        `INSERT INTO audit_logs (action, actor, details, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        action,
        meta.actor || '',
        JSON.stringify(details),
        meta.ip || '',
        meta.ua || ''
      );
  } catch (err) {
    // Auditing must never crash the request path
    console.error('[audit] failed:', err);
  }
}

/**
 * Removes audit log entries older than 365 days.
 * Call from a cron or on app startup.
 */
export function pruneOldAuditLogs() {
  getDb()
    .prepare(`DELETE FROM audit_logs WHERE created_at < datetime('now', '-365 days')`)
    .run();
}
