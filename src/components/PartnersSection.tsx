import { ensureSchema, getDb } from '@/lib/db';
import { PartnerMarquee } from './PartnerMarquee';

type Partner = {
  id: number;
  name: string;
  category: string;
  logo_url: string;
};

export async function PartnersSection() {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, name, category, logo_url
    FROM partners WHERE is_published = 1
    ORDER BY display_order, name
  `);
  const all = r.rows as unknown as Partner[];

  const developers = all.filter((p) => p.category === 'developer');
  const banking = all.filter((p) => p.category === 'banking');

  if (developers.length === 0 && banking.length === 0) return null;

  return (
    <section className="py-14 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 mb-10">
        <span className="chip">Our Network</span>
        <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl tracking-tight">
          Trusted by India&rsquo;s leading developers.
        </h2>
        <p className="mt-3 text-ink-muted leading-relaxed max-w-2xl">
          We work with developers who build and lenders who finance. Two sides of every great
          home, one network behind us.
        </p>
      </div>

      {developers.length > 0 && (
        <div className="mb-10">
          <p className="mx-auto max-w-7xl px-5 lg:px-8 text-[11px] uppercase tracking-[0.18em] text-ink-dim mb-4">
            Developer Partners
          </p>
          <PartnerMarquee partners={developers} reverse={false} duration={42} />
        </div>
      )}

      {banking.length > 0 && (
        <div>
          <p className="mx-auto max-w-7xl px-5 lg:px-8 text-[11px] uppercase tracking-[0.18em] text-ink-dim mb-4">
            Banking & Finance Partners
          </p>
          <PartnerMarquee partners={banking} reverse duration={50} />
        </div>
      )}
    </section>
  );
}
