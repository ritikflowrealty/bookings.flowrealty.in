-- Migration 004: Web Push notification subscriptions

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  portal TEXT NOT NULL,                -- 'cp' | 'developer' | 'customer' | 'admin'
  user_id INTEGER,                     -- nullable for admin (single-tenant)
  email TEXT NOT NULL,
  user_agent TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_push_portal_user ON push_subscriptions(portal, user_id);
CREATE INDEX IF NOT EXISTS idx_push_email ON push_subscriptions(email);

-- For tracking which users have approved Gmail accounts (admins approve via /admin)
-- The existing channel_partners.status='approved', developer_users.status='active',
-- customer_users.status='active' fields already serve this. No new table needed.
