# Flow Realty — Project Handoff

This is a single-document context dump so a new chat in another Kiro account can pick up where this one left off without losing any state.

---

## Quick orientation

**Project:** `bookings.flowrealty.in` — a Next.js 15 booking gateway that has now expanded into the full Flow Realty marketing website with a CMS, channel partner portal, and SEO-driven landing pages.

**Repo:** `https://github.com/ritikflowrealty/bookings.flowrealty.in`
**Branch:** `main`
**Latest commit:** `e6b3c36 feat: phase 4 - admin CMS for CP approval queue, site settings editor, dynamic homepage from settings`

**Hosting:**
- App: Vercel (project `bookingsflowrealty.vercel.app`, custom domain `booking.flowrealty.in`)
- Database: Turso libSQL (SQLite-compatible, serverless)
- File storage: Cloudflare R2 (KYC docs, brochures, images, building model)
- Email: Brevo (transactional + SMTP)
- DNS: Squarespace (CNAME `booking` → vercel-dns)

**Restore points (tags + branches on GitHub):**
- `stable-v1.0-2026-05-19` and branch `backup/stable-v1.0` — booking site only, before main-site expansion
- `stable-v1.1-2026-05-19` and branch `backup/stable-v1.1` — booking site with logo halo + Cashfree integration

To roll back: `git checkout stable-v1.0-2026-05-19` or pin Vercel to the matching commit.

---

## Tech stack

- **Next.js 15.5.18** App Router, TypeScript strict
- **Tailwind CSS** with custom tokens (dark base + neon gradient palette)
- **@libsql/client** for Turso
- **Lenis** for smooth scroll, IntersectionObserver-based reveals (Rustomjee feel)
- **Razorpay + Cashfree** SDKs (per-project payment provider, mutex)
- **@aws-sdk/client-s3 + presigner** for R2 uploads (S3-compatible)
- **Brevo REST API** for transactional email
- **Vercel Analytics + Speed Insights**
- Custom email-OTP auth for portals (CP / Developer / Customer)
- Custom server-side admin auth via `ADMIN_PASSWORD`

---

## Environment variables (set these in Vercel)

```
# Core
ADMIN_PASSWORD=                   # already set
NEXT_PUBLIC_SITE_URL=https://booking.flowrealty.in

# Turso DB
DATABASE_URL=libsql://...turso.io
DATABASE_AUTH_TOKEN=

# Razorpay (optional global; per-project keys override)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Brevo email
BREVO_API_KEY=
EMAIL_FROM_NAME=Flow Realty
EMAIL_FROM_ADDRESS=hello@flowrealty.in

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=flowrealty-assets
R2_PUBLIC_URL=https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev

# Google OAuth (reserved for future — not used yet)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://booking.flowrealty.in
```

---

## Repository layout

```
.
├── DESIGN.md                  Design system contract (colors, fonts, motion)
├── DEPLOYMENT.md              Vercel + Turso deploy guide
├── README.md                  Setup overview
├── HANDOFF.md                 This file
├── db/
│   ├── schema.sql             Original projects/bookings/audit/sessions tables
│   ├── seed.sql               12 projects across 7 developers
│   ├── migrations/
│   │   ├── 002_main_site.sql  CMS, CP, developer, customer, leads, walkins, etc.
│   │   └── 003_otp_sessions.sql  OTP codes + portal sessions
│   └── seeds/
│       └── 002_taxonomy.sql   Bangalore locations / configs / budgets / settings defaults
├── scripts/
│   ├── init-db.ts             npm run db:init — applies all migrations + seeds
│   └── reset-db.ts            DEV ONLY — drops local file
├── public/                    logo.png, favicon.jpg, building images
├── src/
│   ├── app/                   App Router pages + APIs
│   ├── components/            Reusable UI
│   └── lib/                   Server-side helpers
├── Ideas-Do not upload or push anywhere/   gitignored — Rustomjee + flowrealty.in zips
├── .env.example
├── next.config.js
└── package.json
```

---

## What's been done (chronological)

### Phase 0 — Booking gateway (already shipped, working)
- Project tiles homepage with 3D mouse-tracking, lights on/off house image, animated buttons
- `/book/[slug]` per-project booking form with full validation
- Razorpay AND Cashfree payment integration (per-project mutex via `payment_provider` field)
- Booking success page with reference number
- 365-day audit log retention
- Admin panel at `/admin` with password gate (constant-time comparison, server-side only)
- Admin can: add/edit/delete projects, toggle Visible/Booking/Payment, manage Razorpay or Cashfree keys, set brochure URL and trust points

### Phase 1 — Main site foundation (just shipped)
- 18-table CMS database schema: locations, budget_ranges, configurations, developers, project_locations, project_configurations, team_members, awards, news_items, case_studies, testimonials, faqs, pages, site_settings, channel_partners, leads, cp_invoices, developer_users, walkins, customer_users, customer_units, customer_documents, customer_notifications, admin_users, enquiries
- File-based migration runner with `schema_migrations` tracking
- Lenis smooth-scroll mounted in root layout
- `<PageReveal>` rises content from bottom on every route change
- `<SectionReveal>` IntersectionObserver-based per-section reveal with 80ms stagger
- Brevo email helper (`src/lib/email.ts`) with branded HTML template
- R2 upload helper (`src/lib/r2.ts`) with pre-signed PUT URLs
- Bangalore taxonomy seeded: 12 micro-markets + 6 BHK configs + 8 budget tiers + Mysore + Bhubaneswar
- New navbar: Home / Projects / Team Flow / Bro Portal / Enquire Now (CTA)
- Rich SEO footer with location + budget + configuration links
- `/projects`, `/team`, `/bro-portal`, `/enquire`, `/api/enquiries` stub pages

### Phase 2 — SEO landing pages (just shipped)
- `/[city]/page.tsx` — city hub (Bangalore, Mysore, Bhubaneswar)
- `/[city]/flats-in-[location]/page.tsx` — location pages (12 Bangalore, 2 Mysore, 1 Bhubaneswar = 15 pages)
- `/[city]/[slug]/page.tsx` — handles BOTH configuration pages and budget pages (30+ unique landing pages from one route file)
- Each page: unique meta_title + meta_description, breadcrumbs (with schema.org JSON-LD), related links to other taxonomies, inline enquire CTA
- Auto-generated sitemap.xml covering every city + location + config + budget + project URL
- `lib/taxonomy.ts` — data layer for locations, budgets, configurations, developers, project filtering

### Phase 3 — Bro Portal (just shipped)
- `/bro-portal` landing page
- `/bro-portal/register` 4-section form: personal, KYC, files, submit
- 4 R2 file uploads in parallel: RERA, Aadhaar, PAN, photo
- `/api/cp/upload-url` returns pre-signed PUT URLs for direct browser-to-R2
- `/api/cp/register` saves CP record with `status='pending'`, emails CP confirmation + internal team
- `/bro-portal/login` email-OTP login (6-digit code via Brevo, 10-min expiry, 5-attempt limit)
- `/api/portal/otp/{request,verify}` and `/api/portal/logout`
- `/bro-portal/dashboard` server-component with auth gate, shows stats + project list + recent leads
- `/bro-portal/projects/[slug]/lead` 3-step lead submission form (matching Sparkle Realty CP form pattern user shared)
- `/api/cp/leads` server-side validation, generates LD-YYYYMMDD-XXX reference, emails internal team

### Phase 4 — Admin CMS extension (just shipped)
- `/api/admin/cp` lists CPs by status filter (pending / approved / rejected / suspended / all)
- `/api/admin/cp/[id]` PUT supports approve / reject / suspend / activate, emails CP on each transition
- `/api/admin/settings` GET + PUT for site_settings (hero video URL, contact info, stats numbers, social URLs)
- Admin dashboard now has 4 tabs: Projects / Bookings / Channel Partners / Settings
- `CPManagement.tsx` shows photo, KYC info, doc links, action buttons per status
- `SettingsEditor.tsx` form for 21 site settings — all editable from admin

### Homepage v2 (just shipped)
- `Hero.tsx` is now async server component pulling headline/subheadline/video URL from site_settings
- `<HeroVideo>` autoplays muted HD video on the right when `hero_video_url` is set; falls back to lights on/off house image
- `WhyChooseUs.tsx` async, dynamic counts from settings (₹3500 Cr, 5 years, 75 team, 1000 CPs)
- `AboutContact.tsx` async, contact info from settings

---

## What remains (next work in priority order)

### High priority — finish what's started

**Phase 5: Developer Portal**
- `/developer-portal/login` (reuse `OtpLoginForm` with `portal="developer"`)
- `/developer-portal/dashboard`: their projects, bookings, walkins per week/month, lead view (CP names anonymized per spec)
- Admin CMS for inviting developer users via email
- `developer_users` table is already there

**Phase 6: Customer Portal**
- Customer accounts created from admin panel
- `/my-home/login` (OTP)
- `/my-home/dashboard`: their bookings/units, construction stage, document library, agreements, notifications
- `customer_users`, `customer_units`, `customer_documents`, `customer_notifications` tables already there
- File upload flow same R2 pattern as CP docs

**Phase 7: Lead management UI in admin**
- View all leads (CP-submitted + enquiry-submitted + walk-ins)
- Filter by status (new, contacted, qualified, site_visit, booked, lost)
- Convert lead → booking
- Assign leads to internal team members
- Walk-in tracking (manual entry by sales)

**Phase 8: CP Invoice flow**
- CP uploads invoice from `/bro-portal/invoices` (R2 pattern again)
- Admin reviews from `/admin` → Channel Partners → Invoices tab
- Status transitions: submitted → under_review → approved → paid
- Email each transition

**Phase 9: Content management for marketing pages**
- Admin CRUD for: team_members, awards, news_items, case_studies, testimonials, faqs, pages, locations, budget_ranges, configurations, developers
- Most tables exist, just need admin CRUD UIs and public pages
- `team_members` should populate `/team` dynamically
- `news_items` populates `/news` and `/news/[slug]`
- `case_studies` populates `/case-studies` and `/case-studies/[slug]`
- `testimonials` shown on home + about
- FAQs scoped to global / location / configuration / budget / project

### Medium priority

**Role-based admin access**
- `admin_users` table already exists with role enum ('owner' / 'website_manager' / 'cp_manager' / 'customer_manager' / 'booking_only' / 'viewer')
- Currently single password `ADMIN_PASSWORD` works; need to migrate to per-user OTP + role-scoped APIs

**Image optimization at upload**
- When admins upload via R2 pre-signed URLs, send through a server-side resize step (sharp) before final R2 commit
- Or use Cloudflare Image Resizing in front of R2

**Tag projects to taxonomies**
- Admin UI for `project_locations` and `project_configurations` so SEO landing pages start showing real curated lists per filter
- Currently filter pages fall back to "all visible projects in city" until tagged

### Low priority but valuable

**Hreflang / multi-locale prep**
- For now site is English-only; structure is ready for `/hi-IN/` etc. later

**Schema.org enrichment**
- `RealEstateListing` JSON-LD on project pages
- `Organization` + `RealEstateAgent` on home
- `FAQPage` on filter pages with FAQs
- `Article` on news posts

**Performance audits**
- The site is already fast; future audit should check Core Web Vitals on real Vercel Analytics data
- Image lazy loading + R2 CDN already in place

---

## Important code/state notes

1. **`ADMIN_PASSWORD` is `FlowRealty2026!` by default** if no env var set. Override in Vercel.
2. **Migrations are idempotent** — every cold start runs `runMigrations()` and `runSeeds()`. New SQL files in `db/migrations/` and `db/seeds/` auto-apply once.
3. **`Ideas-Do not upload or push anywhere/`** folder is gitignored. Contains Rustomjee + flowrealty.in zip dumps used as inspiration. Don't push these.
4. **OTP email enumeration is intentionally hidden** — `/api/portal/otp/request` always returns success even if email isn't in DB.
5. **CP photo + KYC docs are PUBLIC R2 URLs** by current design. If you want signed read URLs, change R2 bucket to private and add a `/api/cp/doc/[id]` proxy route.
6. **The site URL `booking.flowrealty.in` will eventually be `flowrealty.in`** per founder's plan — domain swap to be done later, no code change required.
7. **Restore points are pushed to GitHub as both tags and branches**. To restore: `git checkout stable-v1.0-2026-05-19`.
8. **`scripts/analyze-inspiration.cjs`** is one-time analysis tool — output goes to `Ideas-Do not.../INSPIRATION_REPORT.md` (gitignored). Already run; report shows Rustomjee uses 3 schema.org blocks, 120 internal links, and `/mumbai/<filter>/` URL pattern (we mirrored this with `/bangalore/<filter>/`).

---

## How to continue in the new chat

In the new Kiro chat, paste this entire `HANDOFF.md` as the first message OR the user can simply attach/reference this file. Then say:

> "Pick up the Flow Realty project from `HANDOFF.md`. Repo is `https://github.com/ritikflowrealty/bookings.flowrealty.in`. Latest commit `e6b3c36`. Continue with Phase 5 (Developer Portal) per the roadmap."

Or whichever phase you want to tackle next.

The repo is the source of truth — anyone with the GitHub access (and the env vars in Vercel) can clone, run `npm install && npm run db:init && npm run dev`, and have a working dev environment in 60 seconds.

---

## Build commands

```bash
npm install
cp .env.example .env.local           # configure
npm run db:init                       # apply migrations + seeds
npm run dev                           # http://localhost:3000
npm run build                         # production build
npm run start                         # production server
```

For Vercel: just connect GitHub repo, set env vars, deploy. Database migrations auto-apply on first cold start.

---

## Push pattern (PowerShell-friendly)

```powershell
git add -A
git commit -m "your message"
git push https://<user>:<pat>@github.com/ritikflowrealty/bookings.flowrealty.in.git main:main
```

PowerShell sometimes flags git's stderr output as an error even on success. Look for the line `xxxxxxx..yyyyyyy main -> main` to confirm the push reached the remote.

---

## End

This file plus the GitHub repo plus the Vercel env vars = complete project state. The new chat starts from a fully-pushed, building, deployed codebase.
