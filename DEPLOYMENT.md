# Deployment Guide — Vercel + Turso

This is the recommended setup. Vercel hosts the Next.js app. Turso hosts the database. Schema and seed live in the repo, so any environment can rebuild itself.

## 1. Create a Turso database (free)

1. Sign up at [turso.tech](https://turso.tech).
2. Install the CLI (optional) or use the web UI to create a database. Pick a region close to your users (Bangalore: `bom` or `ap-south-1` family).
3. Copy two values:
   - **Database URL** — looks like `libsql://flow-realty-<you>.turso.io`
   - **Auth token** — long opaque string. Generate with the CLI (`turso db tokens create flow-realty`) or the dashboard.

## 2. Add environment variables to Vercel

In your Vercel project go to **Settings → Environment Variables** and add:

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | a strong password you'll use to log into `/admin` |
| `DATABASE_URL` | the `libsql://...` URL from Turso |
| `DATABASE_AUTH_TOKEN` | the auth token from Turso |
| `NEXT_PUBLIC_SITE_URL` | `https://booking.flowrealty.in` (or your Vercel URL until DNS is set) |

Mark them for all environments (Production, Preview, Development) so previews work too.

## 3. Redeploy

Trigger a redeploy in Vercel. The first request to any page will:

1. Connect to Turso.
2. Apply `db/schema.sql` if the tables don't exist yet.
3. Insert `db/seed.sql` if the projects table is empty.

This means **you don't need to seed manually**. But if you'd like to, you can run from your laptop:

```bash
DATABASE_URL=libsql://...turso.io DATABASE_AUTH_TOKEN=... npm run db:init
```

## 4. Sign in and configure projects

- Open `https://your-vercel-url/admin`.
- Sign in with `ADMIN_PASSWORD`.
- For each project, paste the live Razorpay key id and secret, then turn on `Visible`, `Booking`, `Payment`.
- Changes go live immediately.

## 5. Connect your subdomain

In Vercel: **Settings → Domains → Add** `booking.flowrealty.in`. Vercel will show the DNS record to add at your registrar (CNAME or A record). After DNS propagation Vercel issues a TLS certificate automatically.

## Local Development

```bash
npm install
cp .env.example .env.local
# leave DATABASE_URL blank to use a local SQLite file
# set ADMIN_PASSWORD
npm run db:init
npm run dev
```

The local file lives at `data/flow-realty.db` and is gitignored.

## Why Turso instead of Supabase or a VM

- Same SQL dialect as the local file. No code change between dev and prod.
- Free tier handles thousands of bookings.
- Reads are sub-millisecond from edge regions.
- No connection pooling drama on Vercel cold starts.
- One auth token, no schema migrations to babysit.

## Backups

Turso supports point-in-time backups in the dashboard. For extra safety, run a periodic `turso db dump` from a cron and store the SQL somewhere safe.

## Switching providers later

If you ever want to move off Turso, the schema and seed files in `db/` are plain SQLite SQL. Pick another libSQL host or a VM with `better-sqlite3`, point `DATABASE_URL` at it, and run `npm run db:init`.

## Pushing to GitHub

```bash
git add .
git commit -m "feat: migrate to libsql for vercel"
git push
```

Vercel will auto-deploy on push if the GitHub integration is connected.

## Security recap

- Admin password is server-side only. Never bundled into the client.
- TLS 1.2+ enforced via HSTS header.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy.
- All inputs sanitized server-side.
- No card data stored; Razorpay handles capture.
- Audit logs include actor, IP, action, details. Retention 365 days.
