import { ensureSchema, getDb } from '@/lib/db';
import { FoundersStage, type FounderStageItem } from './FoundersStage';

type Row = {
  id: number;
  name: string;
  designation: string;
  photo_url: string;
  cutout_url: string;
  bio: string;
  linkedin_url: string;
  pedigree: string;
};

export async function FounderCreds({ hideHeading = false }: { hideHeading?: boolean } = {}) {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, name, designation, photo_url, cutout_url, bio, linkedin_url, pedigree
    FROM team_members
    WHERE is_published = 1 AND category = 'cofounder'
    ORDER BY display_order, name
  `);
  const rows = r.rows as unknown as Row[];

  const founders: FounderStageItem[] = rows.map((f) => ({
    id: f.id,
    name: f.name,
    designation: f.designation,
    cutout_url: f.cutout_url || f.photo_url,
    bio: f.bio || '',
    linkedin_url: f.linkedin_url || '',
    pedigree: (f.pedigree || '').split('|').map((s) => s.trim()).filter(Boolean),
  }));

  return <FoundersStage founders={founders} hideHeading={hideHeading} />;
}
