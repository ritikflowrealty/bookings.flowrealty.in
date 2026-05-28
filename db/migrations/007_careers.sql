-- ============================================================
-- CAREER APPLICATIONS (public "Join Flow" form submissions)
-- Replaces the old mailto:-only flow on /careers.
-- CV is uploaded directly to R2 by the browser; we only persist
-- the resulting public URL.
-- ============================================================
CREATE TABLE IF NOT EXISTS career_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  city TEXT DEFAULT '',
  role_interest TEXT DEFAULT '',          -- sales / marketing / tech / ops / finance / other
  experience_years TEXT DEFAULT '',       -- '0-1', '1-3', '3-5', '5-10', '10+'
  current_company TEXT DEFAULT '',
  current_role TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  portfolio_url TEXT DEFAULT '',
  message TEXT DEFAULT '',
  cv_url TEXT DEFAULT '',                 -- R2 public URL for the uploaded CV
  cv_filename TEXT DEFAULT '',            -- original file name for display
  source_page TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',     -- new / shortlisted / interviewing / hired / rejected
  notes TEXT DEFAULT '',                  -- internal hiring notes
  assigned_to TEXT DEFAULT '',            -- recruiter email
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_career_apps_created ON career_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_apps_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_apps_role ON career_applications(role_interest);
