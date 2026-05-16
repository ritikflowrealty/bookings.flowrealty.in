# Flow Realty Bookings

A self-contained Next.js application for `booking.flowrealty.in`. Customers browse premium residential projects across Bengaluru, Mysuru, and beyond, and complete a provisional booking through a per-project Razorpay account. A password-protected admin panel lets the team manage projects, toggle visibility, and configure Razorpay credentials.

The entire database lives inside the repo as schema and seed SQL. No Supabase, no external services besides Razorpay. The runtime database is a local SQLite file (gitignored) that any contributor or deploy target rebuilds automatically.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **better-sqlite3** for an embedded zero-config database
- **Razorpay Node SDK** for orders and signature verification

## Project Layout

```
.
├── db/
│   ├── schema.sql        # tables, indexes, pragmas
│   └── seed.sql          # 12 projects across 7 developers
├── data/                 # SQLite file lives here at runtime (gitignored)
├── scripts/
│   ├── init-db.ts        # idempotent: applies schema + seed
│   └── reset-db.ts       # destructive: wipes and reinitialises
├── src/
│   ├── app/              # routes + APIs
│   ├── components/       # navbar, hero, tiles, footer
│   └── lib/              # db, auth, razorpay, validation, audit
├── public/               # favicon, static assets
├── .env.example
└── package.json
```

## Quick Start

```bash
# 1. install dependencies
npm install

# 2. copy env
cp .env.example .env.local
# then edit .env.local — at minimum set ADMIN_PASSWORD

# 3. init the database (idempotent)
npm run db:init

# 4. run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the customer site and [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

The seed script preloads `Sipani City` with the test Razorpay keys so you can take a payment end-to-end immediately. Every other project is disabled until you set its credentials in the admin panel.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | yes | Verified server-side only. Never sent to the browser. |
| `ADMIN_SESSION_SECRET` | recommended | Reserved for future signed cookies. |
| `DATABASE_PATH` | no | Defaults to `./data/flow-realty.db`. |
| `NEXT_PUBLIC_SITE_URL` | no | Used in metadata, sitemap, OpenGraph. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | no | Optional global fallback. Per-project keys always override. |

## Admin Panel

- Visit `/admin` and sign in with `ADMIN_PASSWORD`.
- The password is checked using a constant-time comparison; **it is not bundled into the client**, so it cannot be read via DevTools, view source, or the network tab.
- Sessions are random 32-byte tokens stored in `admin_sessions` with a 24-hour TTL.
- Every admin action is recorded in `audit_logs` (365-day retention).
- Per project you can:
  - Toggle `Visible`, `Booking`, and `Payment` independently.
  - Edit name, developer, city, description, image URL, learn-more URL, highlight badge.
  - Update Razorpay key id and secret (write-only field).
  - Add and delete projects.
- Booking and payment toggles are blocked at the API layer until the project has both a Razorpay key and secret saved.

## Razorpay Flow

1. Customer submits the booking form.
2. `/api/bookings/create` validates, creates a row in `bookings`, and creates a Razorpay order using **the project-specific** key/secret. Booking metadata (name, mobile, email, project, unit, etc.) is sent in `notes` so it shows up on the Razorpay dashboard.
3. The browser opens the Razorpay checkout with the returned `order_id` and `key_id`.
4. After payment, `/api/bookings/verify` verifies the HMAC signature server-side and marks the booking as `paid`.
5. The customer lands on `/booking/success?ref=…`.

Failures are recorded with retry counts. After 3 failures the form blocks further attempts and shows the sales contact.

## Security

- HTTPS only (Vercel terminates TLS 1.2+).
- Strict security headers configured in `next.config.js` (HSTS, X-Frame-Options DENY, no-sniff, referrer policy).
- Inputs sanitized server-side (`sanitizeText` strips control characters and enforces max length).
- Razorpay secrets never leave the server. The admin UI sends a new secret only when the user types one.
- No card data is ever stored locally; Razorpay handles all card capture.
- Audit logs include action, actor, IP, and details; pruned to 365 days.

## Database Hosting

This project uses SQLite, so the database is just a file on disk. There are two production approaches:

1. **Single VM / container** — the `data/flow-realty.db` file persists in a mounted volume.
2. **Vercel** — Vercel's filesystem is read-only and ephemeral. For Vercel deployment swap `getDb()` to point at [Turso](https://turso.tech/) (libSQL is SQLite-compatible) or [Cloudflare D1](https://developers.cloudflare.com/d1/). The schema and queries are unchanged.

For your initial setup the local SQLite file works perfectly during development and on a Hetzner / Railway / Fly.io VM.

## Deployment Checklist

- [ ] Set `ADMIN_PASSWORD` in your hosting provider's environment variables.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production URL.
- [ ] Mount a persistent volume for `./data` (or migrate to Turso).
- [ ] Run `npm run db:init` once on first boot.
- [ ] Configure Razorpay live keys per project from the admin panel.
- [ ] Point your DNS for `booking.flowrealty.in` to the host.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in dev mode |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:init` | Apply schema + seed (idempotent) |
| `npm run db:reset` | **Destructive.** Wipe DB and re-seed. |

## License

Proprietary. © Flow Realty.
