import Link from 'next/link';
import { ensureSchema, getDb } from '@/lib/db';
import { AwardsCarousel } from './AwardsCarousel';

type Award = {
  id: number;
  title: string;
  awarding_body: string;
  year: number;
  image_url: string;
};

export async function AwardsHomeStrip() {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, title, awarding_body, year, image_url
    FROM awards WHERE is_published = 1
    ORDER BY display_order, year DESC LIMIT 8
  `);
  const items = r.rows as unknown as Award[];
  if (items.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
          <div className="max-w-2xl">
            <span className="chip">Recognition</span>
            <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Awarded for the work, again and again.
            </h2>
          </div>
          <Link href="/awards" className="btn-ghost text-sm">
            All awards →
          </Link>
        </div>
      </div>
      <AwardsCarousel items={items} />
    </section>
  );
}
