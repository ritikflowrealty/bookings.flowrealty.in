import { ensureSchema, getDb } from '@/lib/db';
import { SectionReveal } from './SectionReveal';

type Testimonial = {
  id: number; client_name: string; designation: string; company: string;
  photo_url: string; quote: string; rating: number;
};

export async function TestimonialsSection() {
  await ensureSchema();
  const r = await getDb().execute(
    `SELECT id, client_name, designation, company, photo_url, quote, rating
     FROM testimonials WHERE is_published = 1 ORDER BY display_order LIMIT 6`
  );
  const items = r.rows as unknown as Testimonial[];
  if (items.length === 0) return null;

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionReveal>
          <span className="chip">Client Speak</span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            What our partners say.
          </h2>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <article key={t.id} className="glass rounded-2xl p-6 flex flex-col reveal">
              <p className="text-sm text-ink-muted leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/10">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt={t.client_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neon-gradient flex items-center justify-center text-xs font-bold text-white">
                    {t.client_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{t.client_name}</p>
                  <p className="text-[11px] text-ink-dim">{t.designation}{t.company ? `, ${t.company}` : ''}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
