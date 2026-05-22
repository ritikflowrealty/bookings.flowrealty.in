import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { ensureSchema, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Case Studies | Flow Realty Sales Outcomes',
  description: 'Real outcomes from Flow Realty\'s sales partnerships across India. Project turnarounds, launch sell-outs, and pricing optimisations.',
};

type CS = {
  id: number; slug: string; title: string; subtitle: string; client_name: string;
  cover_image_url: string; excerpt: string;
  metric_1_label: string; metric_1_value: string;
  metric_2_label: string; metric_2_value: string;
  metric_3_label: string; metric_3_value: string;
};

export default async function CaseStudiesIndex() {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, slug, title, subtitle, client_name, cover_image_url, excerpt,
           metric_1_label, metric_1_value, metric_2_label, metric_2_value, metric_3_label, metric_3_value
    FROM case_studies WHERE is_published = 1
    ORDER BY display_order, id DESC
  `);
  const items = r.rows as unknown as CS[];

  return (
    <>
      <Navbar />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Case Studies</span>
            <h1 className="mt-4 font-display text-5xl tracking-tight">
              Outcomes that speak for themselves.
            </h1>
            <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
              Each engagement below is a real partnership where Flow Realty took on a sales challenge and delivered the numbers.
            </p>
          </SectionReveal>

          {items.length === 0 ? (
            <div className="mt-12 glass rounded-3xl p-12 text-center">
              <p className="text-ink-muted">Case studies coming soon.</p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((c) => (
                <Link key={c.id} href={`/case-studies/${c.slug}`} className="group glass-strong rounded-3xl overflow-hidden hover:shadow-glow transition-all">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">
                    {c.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neon-purple/30 to-neon-orange/30" />
                    )}
                  </div>
                  <div className="p-6">
                    {c.client_name && <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{c.client_name}</p>}
                    <h2 className="mt-1 font-display text-2xl leading-tight">{c.title}</h2>
                    {c.subtitle && <p className="mt-1 text-sm text-ink-muted">{c.subtitle}</p>}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <Metric label={c.metric_1_label} value={c.metric_1_value} />
                      <Metric label={c.metric_2_label} value={c.metric_2_value} />
                      <Metric label={c.metric_3_label} value={c.metric_3_value} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  if (!label && !value) return <div />;
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <p className="font-display text-lg neon-text">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ink-dim mt-0.5">{label}</p>
    </div>
  );
}
