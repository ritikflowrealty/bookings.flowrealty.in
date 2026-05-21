import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';

export const metadata = {
  title: 'Our Services | Flow Realty — Sales & Marketing Outsourcing',
  description: 'Strategy, sales acceleration, creative & digital marketing, channel partner synergy, CRM, and Terra by Flow. End-to-end real estate sales solutions.',
};

const services = [
  {
    title: 'Strategy',
    subtitle: 'Market positioning, pricing & inventory management',
    description: 'We walk the site, study the micro-market, analyse competition, and design a pricing and positioning strategy that maximises velocity without leaving money on the table. Inventory phasing, launch sequencing, and demand forecasting — all before a single unit goes live.',
    icon: '📊',
  },
  {
    title: 'Creative & Digital Marketing',
    subtitle: 'Performance marketing that generates qualified leads at scale',
    description: 'Full-funnel digital campaigns across Meta, Google, and programmatic. Creative production, landing pages, video content, and lead nurturing sequences. Every rupee tracked to a walk-in.',
    icon: '🎯',
  },
  {
    title: 'Sales Acceleration',
    subtitle: 'End-to-end sales execution from launch to last mile',
    description: 'Dedicated on-ground sales teams, walk-in management, conversion optimisation, and closure support. We don\'t just generate leads — we close them. Weekly velocity tracking with real-time dashboards.',
    icon: '⚡',
  },
  {
    title: 'Channel Partner Synergy',
    subtitle: '2000+ CP network activated per project',
    description: 'Onboarding, training, incentive design, and performance tracking for India\'s largest channel partner network. CPs get real-time inventory, brokerage tracking, and dedicated relationship managers.',
    icon: '🤝',
  },
  {
    title: 'CRM',
    subtitle: 'Lead management, walk-in tracking, conversion analytics',
    description: 'Real-time dashboards for developers. Every lead tracked from source to closure. Automated follow-ups, site visit scheduling, and conversion funnel analytics that tell you exactly where deals are stuck.',
    icon: '💻',
  },
  {
    title: 'Terra by Flow',
    subtitle: 'Plot development and land monetisation',
    description: 'Specialised vertical for plotted developments. From land acquisition advisory to plot sales execution. Micro-market analysis, pricing strategy, and sales velocity for plot projects across South India.',
    icon: '🌍',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Our Services</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              We sell what others can&rsquo;t.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
              From cashflow stress to sold-out projects. India&rsquo;s #1 sales and marketing
              outsourcing partner for residential real estate.
            </p>
          </SectionReveal>

          <div className="mt-16 space-y-8">
            {services.map((s, i) => (
              <SectionReveal key={s.title}>
                <div className="glass-strong rounded-3xl p-8 md:p-10 hover:bg-white/[0.06] transition-all duration-300 group">
                  <div className="flex items-start gap-6">
                    <span className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {s.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-ink-dim font-medium">0{i + 1}</span>
                        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight">{s.title}</h2>
                      </div>
                      <p className="mt-1 text-sm text-neon-purple">{s.subtitle}</p>
                      <p className="mt-4 text-ink-muted leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
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
