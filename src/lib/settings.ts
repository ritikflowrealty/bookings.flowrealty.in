import { ensureSchema, getDb } from './db';

export type SiteSettings = Record<string, string>;

let _cache: { data: SiteSettings; at: number } | null = null;
const TTL_MS = 60_000;

export async function getSettings(): Promise<SiteSettings> {
  if (_cache && Date.now() - _cache.at < TTL_MS) return _cache.data;
  await ensureSchema();
  const r = await getDb().execute(`SELECT key, value FROM site_settings`);
  const data: SiteSettings = {};
  for (const row of r.rows as any[]) data[row.key] = row.value;
  _cache = { data, at: Date.now() };
  return data;
}

export function setting(s: SiteSettings, key: string, fallback = ''): string {
  const v = s[key];
  return typeof v === 'string' && v.length > 0 ? v : fallback;
}
