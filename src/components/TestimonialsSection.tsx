import { ensureSchema, getDb } from '@/lib/db';
import { TestimonialsCarousel } from './TestimonialsCarousel';

type Testimonial = {
  id: number; client_name: string; designation: string; company: string;
  photo_url: string; quote: string; rating: number;
};

export async function TestimonialsSection() {
  await ensureSchema();
  const r = await getDb().execute(
    `SELECT id, client_name, designation, company, photo_url, quote, rating
     FROM testimonials WHERE is_published = 1 ORDER BY display_order LIMIT 12`
  );
  const items = r.rows as unknown as Testimonial[];
  if (items.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 mb-10">
        <span className="chip">Partner Speak</span>
        <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight">
          What our partners say.
        </h2>
      </div>
      <TestimonialsCarousel items={items} />
    </section>
  );
}

