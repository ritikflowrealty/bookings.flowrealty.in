import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';

export const metadata = {
  title: 'Our Services | Sales & Marketing Outsourcing | Flow Realty',
  description: 'Strategy, sales acceleration, digital marketing, channel partner synergy, and CRM solutions for residential real estate developers across India.',
};

const services = [
  {
    num: '01',
    title: 'Strategy',
    subtitle: 'Market positioning, pricing & inventory management',
    body: 'We walk the site, study the micro-market, analyse competition, and design a pricing and positioning strategy that creates velocity without leaving money on the table. Inventory phasing, launch sequencing, and demand forecasting built in.',
  },
  {
    num: '02',
    title: 'Sales Acceleration',
    subtitle: 'End-to-end sales execution from launch to last mile',
    body: 'Dedicated sales teams deployed on-site. Walk-in management, follow-up cadence, objection handling, and closure. We own the number and report weekly.',
  },
  {
    num: '03',
    title: 'Creative & Digital Marketing',
    subtitle: 'Performance marketing that generates qualified leads at scale',
    body: 'Meta, Google, programmatic, and content marketing. Creative production, landing pages, A/B testing, and lead qualification. Cost per qualified lead is the only metric we optimise for.',
  },
  {
    num: '04',
    title: 'Channel Partner Synergy',
    subtitle: '1000+ CP network activated per project',
    body: 'Broker onboarding, training, incentive design, and performance tracking. We bring the network, manage the relationships, and ensure CPs are productive from week one.',
  },
  {
    num: '05',
    title: 'CRM & Technology',
    subtitle: 'Lead management, walk-in tracking, conversion analytics',
    body: 'Real-time dashboards for developers. Automated lead routing, follow-up reminders, and conversion funnel visibility. No lead falls through the cracks.',
  },
  {
    num: '06',
    title: 'Terra by Flow',
    subtitle: 'Plot sales and land monetisation',
    body: 'Specialised vertical for plotted developments. Pricing strategy, channel activation, and sales execution tailored to the unique dynamics of plot sales.',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="py-12">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Our Services</span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl tracking-tight leading-[1.05]">
              We sell what others can&rsquo;t.
            </h1>
            <p className="mt-4 max-w-2xl text-ink-muted leading-relaxed">
              From cashflow stress to sold-out projects. Six verticals, one outcome: predictable, profitable sales.
            </p>
          </SectionReveal>

          <div className="mt-16 space-y-6">
            {services.map((s, i) => (
              <SectionReveal key={s.num}>
                <article className="glass-strong rounded-3xl p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start hover:bg-white/[0.04] transition-colors">
                  <div className="lg:col-span-1">
                    <span className="text-xs font-mono text-neon-magenta">{s.num}</span>
                  </div>
                  <div className="lg:col-span-4">
                    <h2 className="font-display text-2xl sm:text-3xl">{s.title}</h2>
                    <p className="mt-1 text-sm text-neon-magenta/80">{s.subtitle}</p>
                  </div>
                  <div className="lg:col-span-7">
                    <p className="text-ink-muted leading-relaxed">{s.body}</p>
                  </div>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </main>
      <InlineEnquireCard
        title="Want Flow to handle sales for your project?"
        body="Tell us where you're stuck. Our team responds within 2 hours."
      />
      <Footer />
    </>
  );
}
