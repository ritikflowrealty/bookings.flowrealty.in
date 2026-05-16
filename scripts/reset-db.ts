/**
 * Wipes the SQLite database and recreates from schema + seed.
 * DESTRUCTIVE. Only run during development.
 *
 * Usage: npm run db:reset
 */
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DATABASE_PATH || './data/flow-realty.db';

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log(`[reset-db] removed ${DB_PATH}`);
}

const journalFiles = ['-journal', '-wal', '-shm'].map((s) => DB_PATH + s);
for (const f of journalFiles) if (fs.existsSync(f)) fs.unlinkSync(f);

import('./init-db');
