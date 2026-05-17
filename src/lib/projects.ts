import { ensureSchema, getDb, rowsAs, type ProjectRow } from './db';

export type PublicProject = {
  id: number;
  slug: string;
  name: string;
  developer: string;
  city: string;
  description: string;
  highlight_text: string;
  image_url: string;
  learn_more_url: string;
  is_visible: boolean;
  booking_enabled: boolean;
  payment_enabled: boolean;
  display_order: number;
};

export function toPublicProject(row: ProjectRow): PublicProject {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    developer: row.developer,
    city: row.city,
    description: row.description || '',
    highlight_text: row.highlight_text || '',
    image_url: row.image_url || '',
    learn_more_url: row.learn_more_url || '',
    is_visible: !!row.is_visible,
    booking_enabled: !!row.booking_enabled,
    payment_enabled: !!row.payment_enabled,
    display_order: row.display_order,
  };
}

export async function listVisibleProjects(): Promise<PublicProject[]> {
  await ensureSchema();
  const result = await getDb().execute(
    `SELECT * FROM projects WHERE is_visible = 1 ORDER BY name ASC`
  );
  return rowsAs<ProjectRow>(result).map(toPublicProject);
}

export async function listAllProjects(): Promise<ProjectRow[]> {
  await ensureSchema();
  const result = await getDb().execute(
    `SELECT * FROM projects ORDER BY display_order ASC, id ASC`
  );
  return rowsAs<ProjectRow>(result);
}

export async function getProjectBySlug(slug: string): Promise<ProjectRow | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT * FROM projects WHERE slug = ?`,
    args: [slug],
  });
  return (rowsAs<ProjectRow>(result)[0]) || null;
}

export async function getProjectById(id: number): Promise<ProjectRow | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT * FROM projects WHERE id = ?`,
    args: [id],
  });
  return (rowsAs<ProjectRow>(result)[0]) || null;
}
