-- Migration 003: OTP-based portal authentication

CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,                 -- sha256 of the 6-digit code
  portal TEXT NOT NULL,                    -- 'cp' | 'developer' | 'customer'
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  ip_address TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email, portal);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

CREATE TABLE IF NOT EXISTS portal_sessions (
  token TEXT PRIMARY KEY,
  portal TEXT NOT NULL,                    -- 'cp' | 'developer' | 'customer'
  user_id INTEGER NOT NULL,                -- FK into the appropriate users table
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip_address TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON portal_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_user ON portal_sessions(portal, user_id);
