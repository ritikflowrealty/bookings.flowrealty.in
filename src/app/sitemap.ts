import type { MetadataRoute } from 'next';
import { listVisibleProjects } from '@/lib/projects';
import { listLocations, listConfigurations, listBudgets } from '@/lib/taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';
const CITIES = ['bangalore', 'mysore', 'bhubaneswar'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/team`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/bro-portal`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/enquire`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    // City hubs
    for (const city of CITIES) {
      base.push({
        url: `${SITE_URL}/${city}/`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

    const [projects, locations] = await Promise.all([
      listVisibleProjects(),
      Promise.all(
        CITIES.map(async (c) => ({
          city: c,
          locs: await listLocations(c.charAt(0).toUpperCase() + c.slice(1)),
        }))
      ),
    ]);

    for (const p of projects) {
      base.push({
        url: `${SITE_URL}/book/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    // Locations + configurations + budgets per city
    for (const { city, locs } of locations) {
      for (const l of locs) {
        base.push({
          url: `${SITE_URL}/${city}/flats-in-${l.slug}/`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      const cityName = city.charAt(0).toUpperCase() + city.slice(1);
      const [configs, budgets] = await Promise.all([
        listConfigurations(cityName),
        listBudgets(cityName),
      ]);
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
  } catch (err) {
    console.error('[sitemap] error', err);
  }

  return base;
}
