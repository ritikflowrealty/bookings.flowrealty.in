import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { ensureSchema, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Flow Realty in the News | Press & Updates',
  description: 'Latest press coverage, market commentary and updates from Flow Realty.',
};

type News = {
  id: number; slug: string; title: string; category: string; excerpt: string;
  cover_image_url: string; external_url: string; author: string; published_at: string;
};

export default async function NewsIndex() {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, slug, title, category, excerpt, cover_image_url, external_url, author, published_at
    FROM news_items WHERE is_published = 1
    ORDER BY published_at DESC, id DESC LIMIT 60
  `);
  const items = r.rows as unknown as News[];

  return (
    <>
      <Navbar />
      <main className="pt-8 pb-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Newsroom</span>
            <h1 className="mt-4 font-display text-5xl tracking-tight">Flow in the News.</h1>
            <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
              Press coverage, market commentary, and updates from across our cities.
            </p>
          </SectionReveal>

          {items.length === 0 ? (
            <div className="mt-12 glass rounded-3xl p-12 text-center">
              <p className="text-ink-muted">No news yet. Check back soon.</p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((n) => {
                const href = n.external_url || `/news/${n.slug}`;
                const external = !!n.external_url;
                return (
                  <Link
                    key={n.id}
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="group glass rounded-3xl overflow-hidden hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">
                      {n.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.cover_image_url} alt={n.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-neon-orange/20" />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                        {n.category} · {n.published_at ? new Date(n.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </p>
                      <h2 className="mt-1 font-display text-xl leading-tight">{n.title}</h2>
                      {n.excerpt && <p className="mt-2 text-sm text-ink-muted line-clamp-3">{n.excerpt}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
