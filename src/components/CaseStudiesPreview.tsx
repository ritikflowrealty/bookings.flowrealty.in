import Link from 'next/link';
import { ensureSchema, getDb } from '@/lib/db';
import { CaseStudiesShowcase } from './CaseStudiesShowcase';

type CS = {
  id: number;
  slug: string;
  title: string;
  client_name: string;
  cover_image_url: string;
  excerpt: string;
  metric_1_label: string;
  metric_1_value: string;
  metric_2_label: string;
  metric_2_value: string;
  metric_3_label: string;
  metric_3_value: string;
};

export async function CaseStudiesPreview() {
  await ensureSchema();
  const r = await getDb().execute(
    `SELECT id, slug, title, client_name, cover_image_url, excerpt,
            metric_1_label, metric_1_value, metric_2_label, metric_2_value, metric_3_label, metric_3_value
     FROM case_studies WHERE is_published = 1 ORDER BY display_order LIMIT 6`
  );
  const items = r.rows as unknown as CS[];
  if (items.length === 0) return null;

  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 mb-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <span className="chip">Case Studies</span>
            <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              See how we did it.
            </h2>
            <p className="mt-3 text-ink-muted leading-relaxed">
              Real numbers from real projects. The results that turned cashflow stress into
              full sell-out.
            </p>
          </div>
          <Link href="/case-studies" className="btn-ghost text-sm">
            View all →
          </Link>
        </div>
      </div>
      <CaseStudiesShowcase items={items} />
    </section>
  );
}
