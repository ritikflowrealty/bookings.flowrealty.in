/**
 * SQLite connection singleton.
 * Auto-runs schema on first access so the app boots even if init-db wasn't run.
 */
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let _db: DatabaseType | null = null;

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getDb(): DatabaseType {
  if (_db) return _db;

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'flow-realty.db');
  ensureDir(dbPath);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Auto-bootstrap schema if tables don't exist yet
  const tableCheck = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'")
    .get();

  if (!tableCheck) {
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      db.exec(fs.readFileSync(schemaPath, 'utf8'));
    }
    const seedPath = path.join(process.cwd(), 'db', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const count = db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
      if (count.c === 0) db.exec(fs.readFileSync(seedPath, 'utf8'));
    }
  }

  _db = db;
  return db;
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
