import type { MetadataRoute } from 'next';
import { listVisibleProjects } from '@/lib/projects';
import { listLocations, listConfigurations, listBudgets } from '@/lib/taxonomy';
import { ensureSchema, getDb } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';
const CITIES = ['bangalore', 'mysore', 'bhubaneswar'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/team`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/awards`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/case-studies`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/careers`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/bro-portal`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/enquire`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    await ensureSchema();

    // City hubs
    for (const city of CITIES) {
      base.push({
        url: `${SITE_URL}/${city}/`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

    const projects = await listVisibleProjects();
    for (const p of projects) {
      base.push({
        url: `${SITE_URL}/book/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    // Locations + configurations + budgets per city
    for (const city of CITIES) {
      const cityName = city.charAt(0).toUpperCase() + city.slice(1);
      const [locs, configs, budgets] = await Promise.all([
        listLocations(cityName),
        listConfigurations(cityName),
        listBudgets(cityName),
      ]);
      for (const l of locs) {
        base.push({
          url: `${SITE_URL}/${city}/flats-in-${l.slug}/`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
      for (const c of configs) {
        base.push({
          url: `${SITE_URL}/${city}/${c.slug}/`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
      for (const b of budgets) {
        base.push({
          url: `${SITE_URL}/${city}/${b.slug}/`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    // News + case studies
    const db = getDb();
    const [newsRows, csRows] = await Promise.all([
      db.execute(`SELECT slug, updated_at FROM news_items WHERE is_published = 1 AND COALESCE(external_url, '') = '' LIMIT 1000`),
      db.execute(`SELECT slug, updated_at FROM case_studies WHERE is_published = 1 LIMIT 500`),
    ]).catch(() => [{ rows: [] }, { rows: [] }]);
    for (const n of newsRows.rows as any[]) {
      base.push({
        url: `${SITE_URL}/news/${n.slug}`,
        lastModified: n.updated_at ? new Date(n.updated_at) : now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
    for (const c of csRows.rows as any[]) {
      base.push({
        url: `${SITE_URL}/case-studies/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch (err) {
    console.error('[sitemap] error', err);
  }

  return base;
}
