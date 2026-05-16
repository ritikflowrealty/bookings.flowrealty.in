/**
 * Wipes the local SQLite database and recreates from schema + seed.
 * DESTRUCTIVE. Only run during development. Skipped in production.
 *
 * Usage: npm run db:reset
 */
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.DATABASE_URL || '';
if (url && !url.startsWith('file:')) {
  console.error('[reset-db] refusing to drop a remote database. Unset DATABASE_URL or use file:.');
  process.exit(1);
}

const localPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'flow-realty.db');

if (fs.existsSync(localPath)) {
  fs.unlinkSync(localPath);
  console.log(`[reset-db] removed ${localPath}`);
}
for (const suffix of ['-journal', '-wal', '-shm']) {
  const p = localPath + suffix;
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

import('./init-db');
