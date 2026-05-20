import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, getDb } from '@/lib/db';
import { guardAdmin } from '@/lib/guard';
import { sanitizeText } from '@/lib/validation';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const r = await getDb().execute(`SELECT key, value FROM site_settings ORDER BY key`);
  const out: Record<string, string> = {};
  for (const row of r.rows as any[]) out[row.key] = row.value;
  return NextResponse.json({ ok: true, settings: out });
}

export async function PUT(req: NextRequest) {
  const denied = await guardAdmin(req);
  if (denied) return denied;
  await ensureSchema();
  const body = (await req.json()) as Record<string, string>;
  const db = getDb();
  // Upsert each key
  for (const [k, v] of Object.entries(body)) {
    const key = String(k).slice(0, 60);
    const value = sanitizeText(String(v ?? ''), 2000);
    await db.execute({
      sql: `INSERT INTO site_settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
      args: [key, value],
    });
  }
  await audit('admin.settings_updated', { keys: Object.keys(body) });
  return NextResponse.json({ ok: true });
}
