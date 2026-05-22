import { ensureSchema, getDb } from '@/lib/db';
import { WhyFlowOrbit, type Vertical } from './WhyFlowOrbit';

type Row = {
  id: number;
  number: string;
  title: string;
  body: string;
  status: string;
  image_url: string;
};

export async function WhyFlowSection() {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, number, title, body, status, image_url
    FROM verticals WHERE is_published = 1
    ORDER BY display_order, id
  `);
  const rows = r.rows as unknown as Row[];
  const verticals: Vertical[] = rows.map((v) => ({
    number: v.number,
    title: v.title,
    body: v.body,
    status: v.status,
    image: v.image_url,
  }));
  return <WhyFlowOrbit verticals={verticals} />;
}
