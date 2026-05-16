# Deployment Guide

This project is a single Next.js app with an embedded SQLite database. There is no Supabase, Firebase, or other external data store. The schema and seed data live in the repo (`db/schema.sql`, `db/seed.sql`) and the runtime database is a local file (`data/flow-realty.db`).

## Where to host

You have three viable options. Pick the one that matches your operational comfort.

### Option 1 — Any VM (simplest)

Hetzner, Railway, Fly.io, DigitalOcean, AWS Lightsail, your own server. Works out of the box.

```bash
git clone https://github.com/ritikflowrealty/bookings.flowrealty.in.git
cd bookings.flowrealty.in
cp .env.example .env.local
# edit .env.local — at minimum set ADMIN_PASSWORD
npm ci
npm run db:init
npm run build
npm run start
```

Use a process manager like `pm2`, `systemd`, or your container runtime to keep the app alive. Mount or persist the `./data` directory so the SQLite file survives restarts.

### Option 2 — Docker

A `Dockerfile` keeps things reproducible. Example:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm ci --omit=dev && apk del python3 make g++
COPY . .
RUN npm run build
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["sh", "-c", "npm run db:init && npm run start"]
```

### Option 3 — Vercel + Turso (if you must deploy serverless)

Vercel's filesystem is read-only and ephemeral, so a local SQLite file does not work there. Swap to Turso (libSQL is SQLite-compatible) by changing `src/lib/db.ts` to use `@libsql/client`:

```bash
npm install @libsql/client
```

Then update `getDb()` to return the libsql client. The schema and queries do not change. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel environment variables.

## Environment variables

Set these in your hosting provider's environment variables panel. Never commit them.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | yes | Admin panel password. Verified server-side, never exposed to the browser. |
| `ADMIN_SESSION_SECRET` | recommended | Reserved for future signed cookies. Set to a 32+ char random string. |
| `DATABASE_PATH` | no | Defaults to `./data/flow-realty.db`. |
| `NEXT_PUBLIC_SITE_URL` | no | Used in metadata, sitemap, OpenGraph. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | no | Optional global fallback. Per-project keys always override. |

## DNS

Point `booking.flowrealty.in` at your host:

- **VM / Docker host:** A record to the host IP, then put a TLS-terminating reverse proxy (Caddy, nginx, Traefik) in front.
- **Vercel:** Add `booking.flowrealty.in` as a custom domain in the Vercel dashboard and update DNS as instructed.

## First-run checklist

1. Set `ADMIN_PASSWORD` in environment variables.
2. Run `npm run db:init` once. This is idempotent. It applies the schema and seeds 12 projects.
3. Visit `/admin`, sign in.
4. Edit each project, paste the live Razorpay key id and secret, and toggle `Visible`, `Booking`, `Payment` on.
5. Verify the project appears on the homepage and the Razorpay checkout opens at `/book/<slug>`.

## Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial flow realty bookings build"
git branch -M main
git remote add origin https://github.com/ritikflowrealty/bookings.flowrealty.in.git
git push -u origin main
```

If you need a personal access token, generate one at [github.com/settings/tokens](https://github.com/settings/tokens) with `repo` scope, then push with:

```
git push https://<user>:<token>@github.com/ritikflowrealty/bookings.flowrealty.in.git main
```

## Database hygiene

- Audit logs are auto-pruned to 365 days when `pruneOldAuditLogs()` is called. Wire this to a daily cron if you run on a long-lived VM.
- Backups: copy `data/flow-realty.db` (and any `*.db-wal` / `*.db-shm` next to it) on a schedule. SQLite supports online backup via `sqlite3 source.db ".backup target.db"`.

## Razorpay

- Each project carries its own `razorpay_key_id` and `razorpay_key_secret`.
- Booking and payment toggles are blocked at the API layer until both are saved.
- Customer details (name, mobile, email, project, unit, address, pincode, reference number) are sent to Razorpay as `notes` on the order, so they appear in the Razorpay dashboard against every transaction.

## Security recap

- Admin password is server-side only. It never appears in client bundles.
- TLS 1.2+ enforced via HSTS header.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy.
- All inputs sanitized server-side.
- No card data stored; Razorpay handles capture.
- Audit logs include actor, IP, action, details. Retention 365 days.
