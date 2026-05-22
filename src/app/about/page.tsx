import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';
import { FounderCreds } from '@/components/FounderCreds';
import { getSettings, setting } from '@/lib/settings';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: "About Flow Realty | India's #1 Sales Partner for Residential Real Estate",
  description:
    "Flow Realty is India's leading real estate sales outsourcing partner. Over ₹4,500 Cr in residential sales delivered across Bangalore, Mysore, and Bhubaneswar.",
};

export default async function AboutPage() {
  const s = await getSettings();
  const salesValue = setting(s, 'total_sales_value', '4500');
  const salesUnit = setting(s, 'total_sales_unit', 'Cr');
  const years = setting(s, 'years_active', '5');
  const cpSize = setting(s, 'cp_distribution_size', '2000');
  const teamSize = setting(s, 'team_size', '80');
  const developersCount = setting(s, 'developers_count', '15');

  return (
    <>
      <Navbar />
      <main className="pt-10 pb-12">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          {/* Hero */}
          <SectionReveal>
            <span className="chip">About Flow Realty</span>
            <h1 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              We sell what others can&rsquo;t.
              <br />
              <span className="neon-text">From cashflow stress to sold-out projects.</span>
            </h1>
          </SectionReveal>

          {/* Our Story */}
          <SectionReveal className="mt-12">
            <h2 className="font-heading uppercase text-2xl sm:text-3xl tracking-tight">
              Our Story
            </h2>
            <p className="mt-4 text-base sm:text-lg text-ink leading-relaxed">
              Real estate&rsquo;s #1 challenge is cashflow. Banks won&rsquo;t lend without sales.
              Buyers won&rsquo;t buy without confidence. We break that cycle.
            </p>
            <p className="mt-4 text-base sm:text-lg text-ink leading-relaxed">
              Founded by alumni of IIM Bangalore and NMIMS Mumbai who spent over a decade at
              India&rsquo;s top developers, Flow Realty was born from a simple insight: developers
              should focus on building great products, not losing sleep over sales.
            </p>
            <p className="mt-4 text-base sm:text-lg text-ink leading-relaxed">
              In just {years} years, we&rsquo;ve facilitated over ₹{salesValue} {salesUnit} in
              residential sales, turned around 40+ projects, and built a {cpSize}+ channel partner
              network. We are India&rsquo;s first B2B Real Estate as a Service (REaaS) enterprise.
            </p>
          </SectionReveal>
        </div>

        {/* Founders — same component as home/team */}
        <FounderCreds />

        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          {/* Stats */}
          <SectionReveal className="mt-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat value={`₹${salesValue}${salesUnit}`} label={`Sales in ${years} years`} />
              <Stat value={`${developersCount}+`} label="Developer partnerships" />
              <Stat value={`${cpSize}+`} label="CP network" />
              <Stat value={`${teamSize}+`} label="Team members" />
            </div>
          </SectionReveal>

          {/* Flow Values — PPC Framework */}
          <SectionReveal className="mt-12">
            <h2 className="font-heading uppercase text-2xl sm:text-3xl tracking-tight">
              Flow Values — The PPC Framework
            </h2>
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
          <SectionReveal className="mt-12">
            <h2 className="font-heading uppercase text-2xl sm:text-3xl tracking-tight">
              How we work
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card
                title="01 · Discovery"
                body="We walk the site, study the market, talk to the developer's existing CRM. No assumptions."
              />
              <Card
                title="02 · System design"
                body="Pricing, channels, CP network activation, sales scripts, micro-market mapping. All before launch."
              />
              <Card
                title="03 · Velocity"
                body="A team that picks up the phone. Walk-ins per week tracked. Conversions optimised every fortnight."
              />
            </div>
          </SectionReveal>

          {/* CTA */}
          <SectionReveal className="mt-12">
            <div className="flex flex-wrap gap-4">
              <Link href="/case-studies" className="btn-neon">
                See how we did it
              </Link>
              <Link href="/services" className="btn-ghost">
                Why Flow?
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
      <p className="font-display text-3xl neon-text font-bold">{value}</p>
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
