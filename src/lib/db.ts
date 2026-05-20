/**
 * libSQL (SQLite-compatible) connection layer.
 *
 * - Local dev: uses `file:./data/flow-realty.db` (set DATABASE_URL or it defaults).
 * - Production: set DATABASE_URL=libsql://<your-db>.turso.io and DATABASE_AUTH_TOKEN.
 *
 * Auto-bootstraps the schema and seed on first use so the app boots even before
 * `npm run db:init` is run manually.
 */
import { createClient, type Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

let _client: Client | null = null;
let _bootstrapped: Promise<void> | null = null;

function buildClient(): Client {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (url) {
    return createClient({ url, authToken });
  }

  // Local default: file under ./data
  const localPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'flow-realty.db');
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return createClient({ url: `file:${localPath}` });
}

export function getDb(): Client {
  if (_client) return _client;
  _client = buildClient();
  return _client;
}

/**
 * Idempotent: applies schema.sql once if the projects table doesn't exist,
 * then runs additive migrations, then seeds if empty.
 */
export async function ensureSchema(): Promise<void> {
  if (_bootstrapped) return _bootstrapped;
  _bootstrapped = (async () => {
    const db = getDb();

    const tableCheck = await db.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='table' AND name='projects'`,
      args: [],
    });

    if (tableCheck.rows.length === 0) {
      const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await execMultiple(db, schema);
      }
    }

    // Run additive migrations safely on existing DBs
    await runMigrations(db);

    const count = await db.execute(`SELECT COUNT(*) as c FROM projects`);
    const c = Number((count.rows[0] as Record<string, unknown>)?.c ?? 0);
    if (c === 0) {
      const seedPath = path.join(process.cwd(), 'db', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seed = fs.readFileSync(seedPath, 'utf8');
        await execMultiple(db, seed);
      }
    }

    // Run additive seeds (idempotent via INSERT OR IGNORE)
    await runSeeds(db);
  })().catch((err) => {
    _bootstrapped = null;
    throw err;
  });
  return _bootstrapped;
}

/**
 * Additive migrations. Each ALTER TABLE is wrapped in try/catch so it's safe
 * to run repeatedly (column already exists = no-op). Also runs SQL files
 * from db/migrations/ in alphabetical order, tracked in `schema_migrations`.
 */
async function runMigrations(db: Client): Promise<void> {
  const addColumns = [
    `ALTER TABLE projects ADD COLUMN cashfree_app_id TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN cashfree_secret_key TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN cashfree_active INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE projects ADD COLUMN cashfree_mode TEXT DEFAULT 'test'`,
    `ALTER TABLE projects ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'razorpay'`,
    `ALTER TABLE projects ADD COLUMN brochure_url TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN trust_point_1 TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN trust_point_2 TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN trust_point_3 TEXT DEFAULT ''`,
    // Main-site expansion: extra project fields used by SEO landing pages
    `ALTER TABLE projects ADD COLUMN starting_price INTEGER DEFAULT 0`,
    `ALTER TABLE projects ADD COLUMN configurations_summary TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN possession_date TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN rera_number TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN gallery_urls TEXT DEFAULT ''`, // JSON array
    `ALTER TABLE projects ADD COLUMN amenities TEXT DEFAULT ''`,    // JSON array
    `ALTER TABLE projects ADD COLUMN locality TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN meta_title TEXT DEFAULT ''`,
    `ALTER TABLE projects ADD COLUMN meta_description TEXT DEFAULT ''`,
  ];
  for (const sql of addColumns) {
    try {
      await db.execute(sql);
    } catch {
      // Column already exists, safe to ignore
    }
  }

  // File-based migrations (idempotent SQL with IF NOT EXISTS / safe ALTER)
  await runFileMigrations(db);
}

async function runFileMigrations(db: Client): Promise<void> {
  // Track which migration files have been applied
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const applied = await db.execute(`SELECT filename FROM schema_migrations`);
  const appliedSet = new Set(
    applied.rows.map((r) => (r as Record<string, unknown>).filename as string)
  );

  for (const f of files) {
    if (appliedSet.has(f)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
    await execMultiple(db, sql);
    await db.execute({
      sql: `INSERT INTO schema_migrations (filename) VALUES (?)`,
      args: [f],
    });
    console.log(`[migrations] applied: ${f}`);
  }
}

/**
 * Idempotent seeds. Each file is applied at most once and tracked in
 * `schema_seeds`. Use INSERT OR IGNORE inside seed files.
 */
async function runSeeds(db: Client): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_seeds (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const seedsDir = path.join(process.cwd(), 'db', 'seeds');
  if (!fs.existsSync(seedsDir)) return;

  const files = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const applied = await db.execute(`SELECT filename FROM schema_seeds`);
  const appliedSet = new Set(
    applied.rows.map((r) => (r as Record<string, unknown>).filename as string)
  );

  for (const f of files) {
    if (appliedSet.has(f)) continue;
    const sql = fs.readFileSync(path.join(seedsDir, f), 'utf8');
    await execMultiple(db, sql);
    await db.execute({
      sql: `INSERT INTO schema_seeds (filename) VALUES (?)`,
      args: [f],
    });
    console.log(`[seeds] applied: ${f}`);
  }
}

/**
 * libsql executes one statement at a time. Split a SQL file on semicolons and
 * skip empty / pragma-only statements safely. Comments are stripped.
 */
async function execMultiple(db: Client, sql: string): Promise<void> {
  const cleaned = sql.replace(/--.*$/gm, '');
  const statements = cleaned
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    const isPragma = /^\s*PRAGMA\b/i.test(stmt);
    try {
      await db.execute(stmt);
    } catch (err) {
      if (isPragma) continue;
      const preview = stmt.slice(0, 120).replace(/\s+/g, ' ');
      throw new Error(`Failed to apply SQL: ${preview} | cause: ${(err as Error).message}`);
    }
  }
}

export type ProjectRow = {
  id: number;
  slug: string;
  name: string;
  developer: string;
  city: string;
  description: string;
  highlight_text: string;
  image_url: string;
  learn_more_url: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_active: number;
  cashfree_app_id: string;
  cashfree_secret_key: string;
  cashfree_active: number;
  cashfree_mode: string;
  payment_provider: string;
  brochure_url: string;
  trust_point_1: string;
  trust_point_2: string;
  trust_point_3: string;
  is_visible: number;
  booking_enabled: number;
  payment_enabled: number;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type BookingRow = {
  id: number;
  reference_number: string;
  project_id: number;
  full_name: string;
  email: string;
  mobile: string;
  tower_unit: string;
  amount: number;
  address: string;
  city: string;
  pincode: string;
  status: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  retry_count: number;
  failure_reason: string;
  created_at: string;
  updated_at: string;
};

/**
 * libsql returns Row objects that look like dicts but with metadata.
 * Cast helper.
 */
export function rowsAs<T>(result: { rows: unknown[] }): T[] {
  return result.rows as T[];
}
