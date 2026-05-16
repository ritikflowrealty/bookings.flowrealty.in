import { getDb, type ProjectRow } from './db';

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

/**
 * Strips Razorpay secrets and other admin-only fields before sending to the client.
 */
export function toPublicProject(row: ProjectRow): PublicProject {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    developer: row.developer,
    city: row.city,
    description: row.description,
    highlight_text: row.highlight_text,
    image_url: row.image_url,
    learn_more_url: row.learn_more_url,
    is_visible: !!row.is_visible,
    booking_enabled: !!row.booking_enabled,
    payment_enabled: !!row.payment_enabled,
    display_order: row.display_order,
  };
}

export function listVisibleProjects(): PublicProject[] {
  const rows = getDb()
    .prepare(`SELECT * FROM projects WHERE is_visible = 1 ORDER BY display_order ASC, id ASC`)
    .all() as ProjectRow[];
  return rows.map(toPublicProject);
}

export function listAllProjects(): ProjectRow[] {
  return getDb()
    .prepare(`SELECT * FROM projects ORDER BY display_order ASC, id ASC`)
    .all() as ProjectRow[];
}

export function getProjectBySlug(slug: string): ProjectRow | null {
  const row = getDb().prepare(`SELECT * FROM projects WHERE slug = ?`).get(slug) as
    | ProjectRow
    | undefined;
  return row || null;
}

export function getProjectById(id: number): ProjectRow | null {
  const row = getDb().prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as
    | ProjectRow
    | undefined;
  return row || null;
}
