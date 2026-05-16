# Flow Realty Bookings

A self-contained Next.js application for `booking.flowrealty.in`. Customers browse premium residential projects across Bengaluru, Mysuru, and beyond, and complete a provisional booking through a per-project Razorpay account. A password-protected admin panel lets the team manage projects, toggle visibility, and configure Razorpay credentials.

The data layer uses [libSQL](https://turso.tech), a SQLite-compatible engine that runs as a local file in development and as a hosted database in production. The schema and seed data live in the repo (`db/schema.sql`, `db/seed.sql`) so any environment can rebuild itself.

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **@libsql/client** for the database (works on Vercel, edge, and local file)
- **Razorpay Node SDK** for orders and signature verification

## Project Layout

```
.
├── db/
│   ├── schema.sql        # tables, indexes, pragmas
│   └── seed.sql          # 12 projects across 7 developers
├── data/                 # local SQLite file lives here in dev (gitignored)
├── scripts/
│   ├── init-db.ts        # idempotent: applies schema + seed
│   └── reset-db.ts       # destructive: wipes local file and re-inits
├── src/
│   ├── app/              # routes + APIs
│   ├── components/       # navbar, hero, tiles, footer
│   └── lib/              # db, auth, razorpay, validation, audit
├── public/               # favicon, static assets
├── .env.example
└── package.json
```

## Quick Start (local)

```bash
npm install
cp .env.example .env.local
# edit .env.local — at minimum set ADMIN_PASSWORD
# DATABASE_URL can stay blank for local file mode
npm run db:init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the customer site and [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

The seed script preloads 12 projects. Sipani City is visible by default but disabled for booking until you add its Razorpay credentials in the admin panel.

## Deploying to Vercel

Vercel's filesystem is read-only, so a local SQLite file does not work in production. Use Turso (free tier is generous and SQLite-compatible).

1. Sign up at [turso.tech](https://turso.tech) and create a database.
2. Copy the libSQL URL (`libsql://<name>-<region>.turso.io`) and create an auth token.
3. In Vercel project settings add three environment variables:
   - `ADMIN_PASSWORD`
   - `DATABASE_URL` = `libsql://<your-db>.turso.io`
   - `DATABASE_AUTH_TOKEN` = the token from Turso
4. Redeploy. The schema and seed are applied automatically on first request.

You can also seed Turso once from your laptop:

```bash
DATABASE_URL=libsql://...turso.io DATABASE_AUTH_TOKEN=... npm run db:init
```

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | yes | Verified server-side only. Never sent to the browser. |
| `DATABASE_URL` | yes (prod) | libSQL URL. Use `libsql://...` in production. Blank in dev = local file. |
| `DATABASE_AUTH_TOKEN` | yes (prod) | Auth token for the hosted libSQL instance. |
| `DATABASE_PATH` | no | Local file path when `DATABASE_URL` is blank. Default `./data/flow-realty.db`. |
| `NEXT_PUBLIC_SITE_URL` | no | Used in metadata, sitemap, OpenGraph. |

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

- HTTPS only (TLS 1.2+ enforced via HSTS).
- Strict security headers configured in `next.config.js` (HSTS, X-Frame-Options DENY, no-sniff, referrer policy).
- Inputs sanitized server-side (`sanitizeText` strips control characters and enforces max length).
- Razorpay secrets never leave the server. The admin UI sends a new secret only when the user types one.
- No card data is ever stored locally; Razorpay handles all card capture.
- Audit logs include action, actor, IP, and details; pruned to 365 days.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in dev mode |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:init` | Apply schema + seed (idempotent, works against any DATABASE_URL) |
| `npm run db:reset` | **Destructive.** Wipes local file and re-seeds. Refuses on remote URLs. |

## License

Proprietary. © Flow Realty.
