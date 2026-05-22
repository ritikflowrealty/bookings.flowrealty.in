import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';
import { ensureSchema, getDb, rowsAs } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT title, meta_title, meta_description, excerpt FROM case_studies WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  const c = r.rows[0] as any;
  if (!c) return {};
  return {
    title: c.meta_title || `${c.title} | Flow Realty Case Study`,
    description: c.meta_description || c.excerpt,
  };
}

type CS = {
  id: number; slug: string; title: string; subtitle: string; client_name: string;
  cover_image_url: string; excerpt: string; content: string;
  metric_1_label: string; metric_1_value: string;
  metric_2_label: string; metric_2_value: string;
  metric_3_label: string; metric_3_value: string;
};

export default async function CaseStudyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT id, slug, title, subtitle, client_name, cover_image_url, excerpt, content,
                 metric_1_label, metric_1_value, metric_2_label, metric_2_value, metric_3_label, metric_3_value
          FROM case_studies WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  const c = rowsAs<CS>(r)[0];
  if (!c) notFound();

  return (
    <>
      <Navbar />
      <main className="pb-12">
        <article className="mx-auto max-w-4xl px-5 lg:px-8">
          <SectionReveal>
            <p className="text-xs text-ink-muted">
              <a href="/case-studies" className="hover:text-ink">← All case studies</a>
            </p>
            {c.client_name && <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink-muted">{c.client_name}</p>}
            <h1 className="mt-2 font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">{c.title}</h1>
            {c.subtitle && <p className="mt-3 text-lg text-ink-muted">{c.subtitle}</p>}
          </SectionReveal>

          {c.cover_image_url && (
            <SectionReveal className="mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.cover_image_url} alt={c.title} className="w-full rounded-3xl object-cover aspect-[16/9]" />
            </SectionReveal>
          )}

          <SectionReveal className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Metric label={c.metric_1_label} value={c.metric_1_value} />
              <Metric label={c.metric_2_label} value={c.metric_2_value} />
              <Metric label={c.metric_3_label} value={c.metric_3_value} />
            </div>
          </SectionReveal>

          <SectionReveal className="mt-10">
            {c.excerpt && <p className="text-lg text-ink-muted leading-relaxed mb-6">{c.excerpt}</p>}
            <div
              className="text-ink-muted leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-ink [&_p]:mb-4 [&_a]:text-ink [&_a]:underline-offset-4 hover:[&_a]:underline"
              dangerouslySetInnerHTML={{ __html: c.content }}
            />
          </SectionReveal>
        </article>
      </main>
      <InlineEnquireCard
        title="Have a project that needs Flow's sales engine?"
        body="Tell us where you're stuck. Our team responds within 2 hours."
      />
      <Footer />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  if (!label && !value) return <div />;
  return (
    <div className="glass rounded-2xl p-5 text-center">
      <p className="font-display text-3xl neon-text">{value || '—'}</p>
      <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">{label}</p>
    </div>
  );
}
