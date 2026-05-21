import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';
import { getSettings, setting } from '@/lib/settings';
import { ensureSchema, getDb } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'About Flow Realty | India\'s #1 Sales Partner for Residential Real Estate',
  description: 'Flow Realty is India\'s leading real estate sales outsourcing partner. Over ₹4,500 Cr in residential sales delivered across Bangalore, Mysore, and Bhubaneswar.',
};

export default async function AboutPage() {
  const s = await getSettings();
  const salesValue = setting(s, 'total_sales_value', '4500');
  const salesUnit = setting(s, 'total_sales_unit', 'Cr');
  const years = setting(s, 'years_active', '5');
  const cpSize = setting(s, 'cp_distribution_size', '2000');
  const teamSize = setting(s, 'team_size', '80');
  const developersCount = setting(s, 'developers_count', '15');

  await ensureSchema();
  const fr = await getDb().execute(`
    SELECT id, name, designation, photo_url, bio, linkedin_url
    FROM team_members WHERE is_published = 1 AND category = 'cofounder'
    ORDER BY display_order, name
  `);
  const founders = fr.rows as unknown as { id: number; name: string; designation: string; photo_url: string; bio: string; linkedin_url: string }[];

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-12">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          {/* Hero */}
          <SectionReveal>
            <span className="chip">About Flow Realty</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              We sell what others can&rsquo;t.
              <br />
              <span className="neon-text">From cashflow stress to sold-out projects.</span>
            </h1>
          </SectionReveal>

          {/* Our Story */}
          <SectionReveal className="mt-12">
            <h2 className="font-heading text-3xl tracking-tight">Our Story</h2>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed">
              Real estate&rsquo;s #1 challenge is cashflow. Banks won&rsquo;t lend without sales.
              Buyers won&rsquo;t buy without confidence. We break that cycle.
            </p>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed">
              Founded by alumni of IIM-Bangalore and NMIMS Mumbai who spent over a decade at
              India&rsquo;s top developers — Lodha Group, Brigade Group, Embassy Group, and Shriram
              Properties — Flow Realty was born from a simple insight: developers should focus on
              building great products, not losing sleep over sales.
            </p>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed">
              In just {years} years, we&rsquo;ve facilitated over ₹{salesValue} {salesUnit} in
              residential sales, turned around 40+ projects, and built a {cpSize}+ channel partner
              network. We are India&rsquo;s first B2B Real Estate as a Service (REaaS) enterprise.
            </p>
          </SectionReveal>

          {/* Founders */}
          {founders.length > 0 && (
            <SectionReveal className="mt-16">
              <h2 className="font-heading text-3xl tracking-tight">{founders.length === 1 ? 'Founder' : 'Co-founders'}</h2>
              <div className={`mt-6 grid gap-6 ${founders.length === 1 ? '' : 'md:grid-cols-2'}`}>
                {founders.map((f) => (
                  <div key={f.id} className="glass-strong rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {f.photo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={f.photo_url}
                          alt={f.name}
                          className="flex-shrink-0 w-24 h-24 rounded-2xl object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-purple/30 to-neon-orange/30 flex items-center justify-center">
                          <span className="font-display text-2xl text-ink">
                            {f.name
                              .split(' ')
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join('')}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display text-2xl">{f.name}</h3>
                        <p className="text-sm text-neon-purple">{f.designation}</p>
                        {f.bio && <p className="mt-3 text-ink-muted leading-relaxed">{f.bio}</p>}
                        {f.linkedin_url && (
                          <div className="mt-4 flex items-center gap-4">
                            <a
                              href={f.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionReveal>
          )}

          {/* Stats */}
          <SectionReveal className="mt-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat value={`₹${salesValue}${salesUnit}`} label={`Sales in ${years} years`} />
              <Stat value={`${developersCount}+`} label="Developer partnerships" />
              <Stat value={`${cpSize}+`} label="CP network" />
              <Stat value={`${teamSize}+`} label="Team members" />
            </div>
          </SectionReveal>

          {/* Flow Values — PPC Framework */}
          <SectionReveal className="mt-16">
            <h2 className="font-heading text-3xl tracking-tight">Flow Values — The PPC Framework</h2>
            <p className="mt-3 text-ink-muted leading-relaxed">
              Every decision at Flow is guided by three principles:
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <ValueCard
                letter="P"
                title="Performance"
                body="We measure outcomes, not effort. Every team, every project, every week — did we move units?"
              />
              <ValueCard
                letter="P"
                title="Predictability"
                body="Developers need to know: how many units will sell this month? Our systems answer that in real-time."
              />
              <ValueCard
                letter="C"
                title="Cashflow"
                body="The ultimate outcome. Everything we do exists to solve one problem: cashflow predictability for developers."
              />
            </div>
          </SectionReveal>

          {/* How we work */}
          <SectionReveal className="mt-16">
            <h2 className="font-heading text-3xl tracking-tight">How we work</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card title="01 · Discovery" body="We walk the site, study the market, talk to the developer's existing CRM. No assumptions." />
              <Card title="02 · System design" body="Pricing, channels, CP network activation, sales scripts, micro-market mapping. All before launch." />
              <Card title="03 · Velocity" body="A team that picks up the phone. Walk-ins per week tracked. Conversions optimised every fortnight." />
            </div>
          </SectionReveal>

          {/* CTA */}
          <SectionReveal className="mt-16">
            <div className="flex flex-wrap gap-4">
              <Link href="/case-studies" className="btn-neon">
                See how we did it
              </Link>
              <Link href="/services" className="btn-ghost">
                Our services
              </Link>
            </div>
          </SectionReveal>
        </div>
      </main>
      <InlineEnquireCard
        title="Start a conversation"
        body="Tell us about your project. Our team responds within 2 hours."
      />
      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="font-display text-3xl neon-text">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-ink-muted mt-1">{label}</p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-6 h-full">
      <h3 className="font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}

function ValueCard({ letter, title, body }: { letter: string; title: string; body: string }) {
  return (
    <div className="glass-strong rounded-2xl p-6 h-full border-l-2 border-neon-purple/50">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold neon-text bg-white/[0.05]">
        {letter}
      </span>
      <h3 className="mt-3 font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}
