import type { MetadataRoute } from 'next';
import { listVisibleProjects } from '@/lib/projects';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];
  try {
    const projects = await listVisibleProjects();
    for (const p of projects) {
      base.push({
        url: `${SITE_URL}/book/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // db may not be reachable yet during build; sitemap still serves base entries
  }
  return base;
}
