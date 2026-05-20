import { ensureSchema, getDb, rowsAs } from './db';

export type Location = {
  id: number; slug: string; name: string; city: string;
  description: string; hero_image_url: string;
  meta_title: string; meta_description: string;
  is_published: number; display_order: number;
};

export type BudgetRange = {
  id: number; slug: string; label: string; city: string;
  min_amount: number; max_amount: number;
  meta_title: string; meta_description: string;
  display_order: number; is_published: number;
};

export type Configuration = {
  id: number; slug: string; label: string; city: string;
  description: string; meta_title: string; meta_description: string;
  display_order: number; is_published: number;
};

export type Developer = {
  id: number; slug: string; name: string; logo_url: string;
  hero_image_url: string; description: string;
  founded_year: number | null; total_projects: number;
  meta_title: string; meta_description: string;
  is_published: number;
};

export async function listLocations(city?: string): Promise<Location[]> {
  await ensureSchema();
  const sql = city
    ? `SELECT * FROM locations WHERE is_published = 1 AND city = ? ORDER BY display_order, name`
    : `SELECT * FROM locations WHERE is_published = 1 ORDER BY display_order, name`;
  const r = await getDb().execute({ sql, args: city ? [city] : [] });
  return rowsAs<Location>(r);
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT * FROM locations WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  return rowsAs<Location>(r)[0] || null;
}

export async function listBudgets(city = 'Bangalore'): Promise<BudgetRange[]> {
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT * FROM budget_ranges WHERE is_published = 1 AND city = ? ORDER BY display_order`,
    args: [city],
  });
  return rowsAs<BudgetRange>(r);
}

export async function getBudgetBySlug(slug: string): Promise<BudgetRange | null> {
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT * FROM budget_ranges WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  return rowsAs<BudgetRange>(r)[0] || null;
}

export async function listConfigurations(city = 'Bangalore'): Promise<Configuration[]> {
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT * FROM configurations WHERE is_published = 1 AND city = ? ORDER BY display_order`,
    args: [city],
  });
  return rowsAs<Configuration>(r);
}

export async function getConfigurationBySlug(slug: string): Promise<Configuration | null> {
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT * FROM configurations WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  return rowsAs<Configuration>(r)[0] || null;
}

export async function listDevelopers(): Promise<Developer[]> {
  await ensureSchema();
  const r = await getDb().execute(
    `SELECT * FROM developers WHERE is_published = 1 ORDER BY name`
  );
  return rowsAs<Developer>(r);
}

export async function getDeveloperBySlug(slug: string): Promise<Developer | null> {
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT * FROM developers WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  return rowsAs<Developer>(r)[0] || null;
}

/**
 * List projects matching a city + optional location/configuration/budget.
 * Falls back to "all visible projects in the city" when filters can't match
 * (so SEO landing pages always have something to show even before admins
 * tag projects to taxonomies).
 */
export async function listProjectsForFilter(opts: {
  city?: string;
  locationId?: number;
  configurationId?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Record<string, unknown>[]> {
  await ensureSchema();
  const db = getDb();

  const where: string[] = ['p.is_visible = 1'];
  const args: (string | number)[] = [];
  if (opts.city) {
    where.push('p.city = ?');
    args.push(opts.city);
  }
  if (opts.locationId) {
    where.push('EXISTS (SELECT 1 FROM project_locations pl WHERE pl.project_id = p.id AND pl.location_id = ?)');
    args.push(opts.locationId);
  }
  if (opts.configurationId) {
    where.push('EXISTS (SELECT 1 FROM project_configurations pc WHERE pc.project_id = p.id AND pc.configuration_id = ?)');
    args.push(opts.configurationId);
  }
  if (opts.maxPrice && opts.maxPrice > 0) {
    where.push('(p.starting_price = 0 OR p.starting_price <= ?)');
    args.push(opts.maxPrice);
  }
  if (opts.minPrice && opts.minPrice > 0) {
    where.push('p.starting_price >= ?');
    args.push(opts.minPrice);
  }

  const r = await db.execute({
    sql: `SELECT p.* FROM projects p WHERE ${where.join(' AND ')} ORDER BY p.name LIMIT 30`,
    args,
  });
  return r.rows as unknown as Record<string, unknown>[];
}
