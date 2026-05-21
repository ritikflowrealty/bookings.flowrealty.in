import Link from 'next/link';
import { ensureSchema, getDb } from '@/lib/db';
import { SectionReveal } from './SectionReveal';

type CS = {
  id: number; slug: string; title: string; client_name: string;
  cover_image_url: string; metric_1_label: string; metric_1_value: string;
};

export async function CaseStudiesPreview() {
  await ensureSchema();
  const r = await getDb().execute(
    `SELECT id, slug, title, client_name, cover_image_url, metric_1_label, metric_1_value
     FROM case_studies WHERE is_published = 1 ORDER BY display_order LIMIT 3`
  );
  const items = r.rows as unknown as CS[];
  if (items.length === 0) return null;

  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionReveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="chip">Case Studies</span>
              <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                See how we did it.
              </h2>
            </div>
            <Link href="/case-studies" className="btn-ghost text-sm">View all →</Link>
          </div>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/case-studies/${c.slug}`}
              className="group glass-strong rounded-3xl overflow-hidden hover:shadow-glow transition-all reveal"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">
                {c.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neon-purple/30 to-neon-orange/30" />
                )}
              </div>
              <div className="p-5">
                {c.client_name && <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{c.client_name}</p>}
                <h3 className="mt-1 font-display text-xl leading-tight">{c.title}</h3>
                {c.metric_1_value && (
                  <p className="mt-3 font-display text-2xl neon-text">{c.metric_1_value} <span className="text-xs text-ink-muted">{c.metric_1_label}</span></p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
