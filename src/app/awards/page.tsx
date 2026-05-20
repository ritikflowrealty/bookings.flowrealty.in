import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { ensureSchema, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Awards & Recognition | Flow Realty',
  description: 'Industry recognition for Flow Realty\'s work as a sales partner across India\'s residential real estate market.',
};

type Award = { id: number; title: string; awarding_body: string; year: number; image_url: string; description: string };

export default async function AwardsPage() {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, title, awarding_body, year, image_url, description
    FROM awards WHERE is_published = 1
    ORDER BY display_order, year DESC
  `);
  const items = r.rows as unknown as Award[];

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Awards</span>
            <h1 className="mt-4 font-display text-5xl tracking-tight">Recognised. Repeatedly.</h1>
          </SectionReveal>

          {items.length === 0 ? (
            <div className="mt-12 glass rounded-3xl p-12 text-center">
              <p className="text-ink-muted">Awards list coming soon.</p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((a) => (
                <article key={a.id} className="glass rounded-2xl p-6">
                  {a.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image_url} alt={a.title} className="w-16 h-16 object-contain" />
                  )}
                  <p className="mt-4 font-display text-lg leading-tight">{a.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">{a.awarding_body}{a.year ? ` · ${a.year}` : ''}</p>
                  {a.description && <p className="mt-3 text-sm text-ink-muted leading-relaxed">{a.description}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
