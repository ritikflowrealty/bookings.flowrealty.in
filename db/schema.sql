-- Flow Realty Booking Database Schema
-- SQLite (better-sqlite3)

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================================
-- projects: master list of bookable projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  developer TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT DEFAULT '',
  highlight_text TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  learn_more_url TEXT DEFAULT '',

  -- Razorpay credentials per project
  razorpay_key_id TEXT DEFAULT '',
  razorpay_key_secret TEXT DEFAULT '',
  razorpay_active INTEGER NOT NULL DEFAULT 0,

  -- Three independent toggles
  is_visible INTEGER NOT NULL DEFAULT 0,
  booking_enabled INTEGER NOT NULL DEFAULT 0,
  payment_enabled INTEGER NOT NULL DEFAULT 0,

  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_visible ON projects(is_visible);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(display_order);

-- ============================================================
-- bookings: customer booking records
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_number TEXT NOT NULL UNIQUE,
  project_id INTEGER NOT NULL,

  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  tower_unit TEXT NOT NULL,
  amount INTEGER NOT NULL,
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  pincode TEXT DEFAULT '',

  status TEXT NOT NULL DEFAULT 'pending',
  -- pending | created | paid | failed | cancelled

  razorpay_order_id TEXT DEFAULT '',
  razorpay_payment_id TEXT DEFAULT '',
  razorpay_signature TEXT DEFAULT '',

  retry_count INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT DEFAULT '',

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_bookings_project ON bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(reference_number);

-- ============================================================
-- audit_logs: 365-day retention of all admin / payment actions
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  actor TEXT DEFAULT '',
  details TEXT DEFAULT '{}',
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- admin_sessions: session tokens for admin panel
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  ip_address TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
