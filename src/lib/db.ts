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
 * then runs seed.sql if there are zero projects. Safe to call on every cold start.
 */
export async function ensureSchema(): Promise<void> {
  if (_bootstrapped) return _bootstrapped;
  _bootstrapped = (async () => {
    const db = getDb();

    // Check whether the projects table exists
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

    const count = await db.execute(`SELECT COUNT(*) as c FROM projects`);
    const c = Number((count.rows[0] as Record<string, unknown>)?.c ?? 0);
    if (c === 0) {
      const seedPath = path.join(process.cwd(), 'db', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seed = fs.readFileSync(seedPath, 'utf8');
        await execMultiple(db, seed);
      }
    }
  })().catch((err) => {
    _bootstrapped = null;
    throw err;
  });
  return _bootstrapped;
}

/**
 * libsql executes one statement at a time. Split a SQL file on semicolons and
 * skip empty / pragma-only statements safely. Comments are stripped.
 */
async function execMultiple(db: Client, sql: string): Promise<void> {
  // Strip line comments
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
      if (isPragma) {
        // Hosted libsql ignores some pragmas. Don't fail the bootstrap because of one.
        continue;
      }
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
