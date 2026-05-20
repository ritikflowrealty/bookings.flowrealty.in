import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';
import { getSettings, setting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'About Flow Realty | India\'s Sales Partner for Residential Real Estate',
  description: 'Flow Realty is India\'s leading real estate sales outsourcing partner. Over ₹3,500 Cr in residential sales delivered across Bangalore, Mysore, and Bhubaneswar.',
};

export default async function AboutPage() {
  const s = await getSettings();
  const salesValue = setting(s, 'total_sales_value', '3500');
  const salesUnit = setting(s, 'total_sales_unit', 'Cr');
  const years = setting(s, 'years_active', '5');
  const cpSize = setting(s, 'cp_distribution_size', '1000');
  const teamSize = setting(s, 'team_size', '75');
  const developersCount = setting(s, 'developers_count', '15');
  const projectsCount = setting(s, 'projects_count', '30');

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-12">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">About Flow Realty</span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl tracking-tight leading-[1.05]">
              Real Estate as a Service.
              <br />
              <span className="neon-text">Sales as a system.</span>
            </h1>
          </SectionReveal>

          <SectionReveal className="mt-10">
            <p className="text-lg text-ink-muted leading-relaxed">
              We are one of India&rsquo;s biggest sales outsourcing partners for residential real
              estate, with a success rate of over 90% across the last {years} years. Whether it is
              a new launch, a stressed project turnaround, or a fresh phase rollout, you can count
              on us to break the sales puzzle and deliver what you exactly need: steady,
              predictable, profitable sales.
            </p>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed">
              The single biggest challenge in real estate is not land or construction. It is
              cashflow predictability. We solve that. Developers focus on their land and
              construction. We make sure they never have a sleepless night worrying about sales.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat value={`₹${salesValue}${salesUnit}`} label={`Residential sales · last ${years} years`} />
              <Stat value={`${developersCount}+`} label="Developer partnerships" />
              <Stat value={`${cpSize}+`} label="CP network" />
              <Stat value={`${teamSize}`} label="Team members" />
            </div>
          </SectionReveal>

          <SectionReveal className="mt-16">
            <h2 className="font-display text-3xl tracking-tight">How we work</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card title="01 · Discovery" body="We walk the site, study the market, talk to the developer's existing CRM. No assumptions." />
              <Card title="02 · System design" body="Pricing, channels, CP network activation, sales scripts, micro-market mapping. All before launch." />
              <Card title="03 · Velocity" body="A team that picks up the phone. Walk-ins per week tracked. Conversions optimised every fortnight." />
            </div>
          </SectionReveal>

          <SectionReveal className="mt-16">
            <h2 className="font-display text-3xl tracking-tight">What we don't do</h2>
            <p className="mt-4 text-ink-muted leading-relaxed">
              We don&rsquo;t list every project we get a call about. We don&rsquo;t take on
              everything. The {projectsCount}+ projects we work with are the projects we believe
              in. The same applies to the buyers we attract: serious, informed, and ready to
              commit.
            </p>
          </SectionReveal>
        </div>
      </main>
      <InlineEnquireCard
        title="Want to know if Flow can help your project?"
        body="Tell us where you're stuck. Our team responds within 2 hours."
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
