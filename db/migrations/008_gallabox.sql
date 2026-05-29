-- ============================================================
-- GALLABOX (per-project WhatsApp notifications)
-- Each project carries its own Gallabox Generic Webhook URL.
-- The URL itself is the secret; no separate API key needed.
-- A global setting `internal_whatsapp_numbers` (comma-separated)
-- handles the "us" team broadcast for events on this project.
-- Only projects with `gallabox_active=1` AND a non-empty URL fire
-- WhatsApp notifications; everything else is a no-op.
-- ============================================================

ALTER TABLE projects ADD COLUMN gallabox_webhook_url TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN gallabox_active INTEGER NOT NULL DEFAULT 0;

-- The developer-side WhatsApp number that should receive updates for
-- this project (sales head, project owner, etc.). 10-digit Indian
-- mobile or with country code; the Gallabox helper normalises it.
ALTER TABLE projects ADD COLUMN developer_whatsapp TEXT DEFAULT '';
