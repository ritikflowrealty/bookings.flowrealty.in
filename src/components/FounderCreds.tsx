import { ensureSchema, getDb } from '@/lib/db';
import { SectionReveal } from './SectionReveal';

type Founder = {
  id: number;
  name: string;
  designation: string;
  photo_url: string;
  bio: string;
  linkedin_url: string;
};

const pedigree = [
  'IIM Bangalore',
  'NMIMS Mumbai',
  'Lodha Group',
  'Brigade Group',
  'Shriram Properties',
  'Embassy Group',
];

export async function FounderCreds() {
  await ensureSchema();
  const r = await getDb().execute(`
    SELECT id, name, designation, photo_url, bio, linkedin_url
    FROM team_members
    WHERE is_published = 1 AND category = 'cofounder'
    ORDER BY display_order, name
  `);
  const founders = r.rows as unknown as Founder[];

  if (founders.length === 0) return null;

  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionReveal>
          <span className="chip">Leadership</span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl tracking-tight">
            People who&rsquo;ve been on both sides.
          </h2>
          <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
            Having worked at India&rsquo;s top developers, our founders know what developers need
            from the inside. They built Flow to solve the problem they saw every day.
          </p>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {founders.map((f) => (
            <div
              key={f.id}
              className="glass-strong rounded-3xl p-6 sm:p-8 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 reveal flex gap-5 sm:gap-6 items-start"
            >
              {f.photo_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={f.photo_url}
                  alt={f.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0 ring-1 ring-white/10"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-display text-xl sm:text-2xl">{f.name}</h3>
                <p className="text-sm text-neon-purple mt-1">{f.designation}</p>
                {f.bio && (
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed">{f.bio}</p>
                )}
                {f.linkedin_url && (
                  <a
                    href={f.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-[0.15em] text-ink-dim mb-4">Pedigree</p>
          <div className="flex flex-wrap gap-3">
            {pedigree.map((p) => (
              <span key={p} className="chip">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
