import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { ensureSchema, getDb, rowsAs } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT title, meta_title, meta_description, excerpt FROM news_items WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  const n = r.rows[0] as any;
  if (!n) return {};
  return {
    title: n.meta_title || `${n.title} | Flow Realty`,
    description: n.meta_description || n.excerpt,
  };
}

type Article = {
  id: number; slug: string; title: string; category: string; excerpt: string; content: string;
  cover_image_url: string; author: string; published_at: string;
};

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureSchema();
  const r = await getDb().execute({
    sql: `SELECT id, slug, title, category, excerpt, content, cover_image_url, author, published_at
          FROM news_items WHERE slug = ? AND is_published = 1 LIMIT 1`,
    args: [slug],
  });
  const a = rowsAs<Article>(r)[0];
  if (!a) notFound();

  return (
    <>
      <Navbar />
      <main className="pb-12">
        <article className="mx-auto max-w-3xl px-5 lg:px-8">
          <SectionReveal>
            <p className="text-xs text-ink-muted">
              <a href="/news" className="hover:text-ink">← All news</a>
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              {a.category} · {a.published_at ? new Date(a.published_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
              {a.author ? ` · By ${a.author}` : ''}
            </p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight leading-[1.05]">{a.title}</h1>
            {a.excerpt && <p className="mt-4 text-lg text-ink-muted leading-relaxed">{a.excerpt}</p>}
          </SectionReveal>
          {a.cover_image_url && (
            <SectionReveal className="mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.cover_image_url} alt={a.title} className="w-full rounded-3xl object-cover aspect-[16/9]" />
            </SectionReveal>
          )}
          <SectionReveal className="mt-10 prose prose-invert max-w-none">
            <div
              className="text-ink-muted leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-ink [&_p]:mb-4 [&_a]:text-ink [&_a]:underline-offset-4 hover:[&_a]:underline"
              dangerouslySetInnerHTML={{ __html: a.content }}
            />
          </SectionReveal>
        </article>
      </main>
      <Footer />
    </>
  );
}
