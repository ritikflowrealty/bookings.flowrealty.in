/**
 * Initializes the SQLite database from schema.sql + seed.sql.
 * Idempotent: safe to run multiple times.
 *
 * Usage: npm run db:init
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DATABASE_PATH || './data/flow-realty.db';
const SCHEMA_PATH = path.join(process.cwd(), 'db', 'schema.sql');
const SEED_PATH = path.join(process.cwd(), 'db', 'seed.sql');

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(DB_PATH);
  const db = new Database(DB_PATH);

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  console.log('[init-db] schema applied');

  const projectCount = db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
  if (projectCount.c === 0) {
    const seed = fs.readFileSync(SEED_PATH, 'utf8');
    db.exec(seed);
    console.log('[init-db] seed data inserted');
  } else {
    console.log(`[init-db] ${projectCount.c} projects already exist, skipping seed`);
  }

  db.close();
  console.log(`[init-db] database ready at ${DB_PATH}`);
}

main();
