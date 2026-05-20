-- Migration 002: Main Site Expansion
-- Adds CMS tables, Channel Partner Portal, Developer Portal, Customer Portal,
-- Lead management, Locations, Budgets, Configurations.
-- Idempotent via IF NOT EXISTS / ALTER ... safe-skip patterns.

-- ============================================================
-- LOCATIONS (Bangalore micro-markets, etc.) — for SEO landing pages
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,                     -- "Sarjapur Road"
  city TEXT NOT NULL,                     -- "Bangalore"
  description TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);

-- ============================================================
-- BUDGET RANGES (Bangalore-realistic tiers)
-- ============================================================
CREATE TABLE IF NOT EXISTS budget_ranges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,                    -- "Under ₹40 Lakhs"
  city TEXT NOT NULL DEFAULT 'Bangalore',
  min_amount INTEGER DEFAULT 0,           -- in INR
  max_amount INTEGER DEFAULT 0,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- CONFIGURATIONS (1 BHK, 2 BHK, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,                    -- "2 BHK Flats"
  city TEXT NOT NULL DEFAULT 'Bangalore',
  description TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- DEVELOPERS (companies whose projects Flow Realty represents)
-- ============================================================
CREATE TABLE IF NOT EXISTS developers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  founded_year INTEGER,
  total_projects INTEGER DEFAULT 0,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- PROJECT TAXONOMY: link projects to locations / configs / budgets / developers
-- ============================================================
CREATE TABLE IF NOT EXISTS project_locations (
  project_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  PRIMARY KEY (project_id, location_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_configurations (
  project_id INTEGER NOT NULL,
  configuration_id INTEGER NOT NULL,
  starting_price INTEGER DEFAULT 0,       -- INR
  area_min INTEGER DEFAULT 0,             -- sqft
  area_max INTEGER DEFAULT 0,
  PRIMARY KEY (project_id, configuration_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (configuration_id) REFERENCES configurations(id) ON DELETE CASCADE
);

-- ============================================================
-- TEAM (Team Flow page)
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,              -- "Co-founder & CEO"
  category TEXT NOT NULL DEFAULT 'leadership',  -- 'leadership' | 'cofounder' | 'team'
  photo_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- AWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS awards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  awarding_body TEXT NOT NULL,
  year INTEGER,
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- NEWS / BLOG / FLOW IN NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS news_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'news',  -- 'news' | 'blog' | 'press'
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',                -- HTML / markdown
  cover_image_url TEXT DEFAULT '',
  external_url TEXT DEFAULT '',           -- if it's a press link, redirect there
  author TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  published_at TEXT,
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news_items(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_items(category);

-- ============================================================
-- CASE STUDIES
-- ============================================================
CREATE TABLE IF NOT EXISTS case_studies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  client_name TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  metric_1_label TEXT DEFAULT '',         -- e.g. "Sales velocity"
  metric_1_value TEXT DEFAULT '',         -- e.g. "+340%"
  metric_2_label TEXT DEFAULT '',
  metric_2_value TEXT DEFAULT '',
  metric_3_label TEXT DEFAULT '',
  metric_3_value TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TESTIMONIALS (Client Speak)
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  designation TEXT DEFAULT '',
  company TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- FAQs (per location / config / budget / global)
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL DEFAULT 'global',  -- 'global' | 'location' | 'configuration' | 'budget' | 'project'
  scope_ref_id INTEGER,                  -- FK to the entity referenced by scope
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_faqs_scope ON faqs(scope, scope_ref_id);

-- ============================================================
-- PAGES — generic CMS-driven pages (about, careers, terms, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,              -- 'about', 'careers', 'csr'
  title TEXT NOT NULL,
  hero_image_url TEXT DEFAULT '',
  hero_video_url TEXT DEFAULT '',
  content TEXT DEFAULT '',                -- HTML/markdown body
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- SITE SETTINGS — single-row config (hero video URL, contact details, social, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- CHANNEL PARTNERS (Bro Portal)
-- ============================================================
CREATE TABLE IF NOT EXISTS channel_partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  google_id TEXT UNIQUE,                  -- if logged in via Google OAuth
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  rera_number TEXT DEFAULT '',
  rera_doc_url TEXT DEFAULT '',           -- R2 URL
  aadhaar_number TEXT DEFAULT '',
  aadhaar_doc_url TEXT DEFAULT '',
  pan_number TEXT DEFAULT '',
  pan_doc_url TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  city TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'suspended'
  approved_by TEXT DEFAULT '',
  approved_at TEXT,
  rejection_reason TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cp_status ON channel_partners(status);
CREATE INDEX IF NOT EXISTS idx_cp_email ON channel_partners(email);

-- ============================================================
-- LEADS (submitted by CPs OR by Enquire Now form)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_number TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,                   -- 'cp' | 'enquiry' | 'walk_in'
  channel_partner_id INTEGER,             -- if source = 'cp'
  project_id INTEGER,                     -- nullable; sometimes leads are project-agnostic

  -- Prospect personal details
  prospect_first_name TEXT NOT NULL,
  prospect_last_name TEXT DEFAULT '',
  prospect_mobile TEXT NOT NULL,
  prospect_alt_mobile TEXT DEFAULT '',
  prospect_email TEXT DEFAULT '',

  -- Prospect preferences
  configuration TEXT DEFAULT '',          -- '2 BHK', '3 BHK'
  budget_range TEXT DEFAULT '',
  preferred_location TEXT DEFAULT '',
  timeline TEXT DEFAULT '',               -- 'immediate' | '1-3 months' | '3-6 months' | '6-12 months'
  notes TEXT DEFAULT '',

  -- Workflow
  status TEXT NOT NULL DEFAULT 'new',     -- 'new' | 'contacted' | 'qualified' | 'site_visit' | 'booked' | 'lost'
  assigned_to TEXT DEFAULT '',            -- internal team member email
  walkin_date TEXT,                       -- ISO date of site visit
  booking_id INTEGER,                     -- FK to bookings if converted
  lost_reason TEXT DEFAULT '',

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (channel_partner_id) REFERENCES channel_partners(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_cp ON leads(channel_partner_id);
CREATE INDEX IF NOT EXISTS idx_leads_project ON leads(project_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- ============================================================
-- CP INVOICES (Bro Portal — CPs upload after lead converts)
-- ============================================================
CREATE TABLE IF NOT EXISTS cp_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_partner_id INTEGER NOT NULL,
  lead_id INTEGER,
  booking_id INTEGER,
  invoice_number TEXT DEFAULT '',
  amount INTEGER NOT NULL,                -- INR
  invoice_doc_url TEXT NOT NULL,          -- R2 URL
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted' | 'under_review' | 'approved' | 'paid' | 'rejected'
  notes TEXT DEFAULT '',
  reviewed_by TEXT DEFAULT '',
  reviewed_at TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (channel_partner_id) REFERENCES channel_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cp_invoices_cp ON cp_invoices(channel_partner_id);
CREATE INDEX IF NOT EXISTS idx_cp_invoices_status ON cp_invoices(status);

-- ============================================================
-- DEVELOPER USERS (Developer Portal login)
-- ============================================================
CREATE TABLE IF NOT EXISTS developer_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  google_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  developer_id INTEGER NOT NULL,          -- which developer they belong to
  role TEXT NOT NULL DEFAULT 'viewer',    -- 'viewer' | 'manager' | 'admin'
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'suspended'
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dev_users_dev ON developer_users(developer_id);

-- ============================================================
-- WALK-INS (recorded by sales team / auto-derived from leads)
-- ============================================================
CREATE TABLE IF NOT EXISTS walkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  lead_id INTEGER,
  channel_partner_id INTEGER,             -- if CP brought them
  walkin_date TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT DEFAULT '',
  recorded_by TEXT DEFAULT '',

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (channel_partner_id) REFERENCES channel_partners(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_walkins_project ON walkins(project_id);
CREATE INDEX IF NOT EXISTS idx_walkins_date ON walkins(walkin_date);

-- ============================================================
-- CUSTOMER PORTAL USERS (homebuyers — login to track their unit)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  google_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  mobile TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'suspended'
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- CUSTOMER UNITS (one customer can hold multiple bookings)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  booking_id INTEGER,
  project_id INTEGER NOT NULL,
  tower_unit TEXT NOT NULL,
  configuration TEXT DEFAULT '',          -- "3 BHK"
  carpet_area_sqft INTEGER DEFAULT 0,
  total_value INTEGER DEFAULT 0,
  construction_stage TEXT DEFAULT 'announced',
  -- 'announced' | 'foundation' | 'structure' | 'finishing' | 'ready' | 'handover'
  expected_possession TEXT,               -- ISO date

  FOREIGN KEY (customer_id) REFERENCES customer_users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_units_cust ON customer_units(customer_id);

-- ============================================================
-- CUSTOMER DOCUMENTS (agreements, payment receipts, NOC, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  unit_id INTEGER,
  doc_type TEXT NOT NULL,                 -- 'agreement' | 'receipt' | 'allocation_letter' | 'noc' | 'other'
  title TEXT NOT NULL,
  doc_url TEXT NOT NULL,                  -- R2 URL
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  uploaded_by TEXT DEFAULT '',

  FOREIGN KEY (customer_id) REFERENCES customer_users(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES customer_units(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_docs_cust ON customer_documents(customer_id);

-- ============================================================
-- CUSTOMER NOTIFICATIONS (system messages — payment due, milestone, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  unit_id INTEGER,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info',      -- 'info' | 'milestone' | 'payment' | 'document'
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (customer_id) REFERENCES customer_users(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES customer_units(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_notif_cust ON customer_notifications(customer_id, is_read);

-- ============================================================
-- ADMIN USERS — role-based access (separate from existing admin_sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  google_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',    -- 'owner' | 'website_manager' | 'cp_manager' | 'customer_manager' | 'booking_only' | 'viewer'
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'suspended'
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- ENQUIRIES (public Enquire Now form submissions)
-- ============================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  city TEXT DEFAULT '',
  configuration TEXT DEFAULT '',
  budget_range TEXT DEFAULT '',
  message TEXT DEFAULT '',
  source_page TEXT DEFAULT '',            -- which URL the enquiry came from
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
