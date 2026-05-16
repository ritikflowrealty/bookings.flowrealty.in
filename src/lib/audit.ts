import { ensureSchema, getDb } from './db';

export async function audit(
  action: string,
  details: Record<string, unknown> = {},
  meta: { actor?: string; ip?: string; ua?: string } = {}
): Promise<void> {
  try {
    await ensureSchema();
    await getDb().execute({
      sql: `INSERT INTO audit_logs (action, actor, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)`,
      args: [action, meta.actor || '', JSON.stringify(details), meta.ip || '', meta.ua || ''],
    });
  } catch (err) {
    // Auditing must never crash the request path
    console.error('[audit] failed:', err);
  }
}

/**
 * Removes audit log entries older than 365 days.
 */
export async function pruneOldAuditLogs(): Promise<void> {
  await getDb().execute(`DELETE FROM audit_logs WHERE created_at < datetime('now', '-365 days')`);
}
