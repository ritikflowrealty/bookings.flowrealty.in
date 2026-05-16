/**
 * Initializes the libsql database from schema.sql + seed.sql.
 * Idempotent: safe to run multiple times. Works for both local files
 * (DATABASE_URL=file:./data/flow-realty.db) and Turso remote URLs.
 *
 * Usage: npm run db:init
 */
import { ensureSchema, getDb } from '../src/lib/db';

async function main() {
  await ensureSchema();
  const r = await getDb().execute('SELECT COUNT(*) as c FROM projects');
  const c = Number((r.rows[0] as Record<string, unknown>).c ?? 0);
  console.log(`[init-db] ready. projects: ${c}`);
}

main().catch((err) => {
  console.error('[init-db] failed:', err);
  process.exit(1);
});
