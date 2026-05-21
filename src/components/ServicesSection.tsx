import { SectionReveal } from './SectionReveal';

const services = [
  {
    title: 'Sales Acceleration',
    body: 'End-to-end sales execution from launch to last mile. Walk-ins, conversions, closures.',
    icon: '⚡',
  },
  {
    title: 'Strategy & Pricing',
    body: 'Market positioning, inventory management, and pricing that moves units without leaving money on the table.',
    icon: '📊',
  },
  {
    title: 'Creative & Digital',
    body: 'Performance marketing, content, and creative that generates qualified leads at scale.',
    icon: '🎯',
  },
  {
    title: 'Channel Partner Synergy',
    body: '1000+ CP network activated per project. Onboarding, training, incentive design.',
    icon: '🤝',
  },
  {
    title: 'CRM & Tech',
    body: 'Lead management, walk-in tracking, conversion analytics. Real-time dashboards for developers.',
    icon: '💻',
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionReveal>
          <span className="chip">Our Services</span>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
            We sell what others can&rsquo;t.
          </h2>
          <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
            From cashflow stress to sold-out projects. India&rsquo;s #1 sales and marketing outsourcing partner for residential real estate.
          </p>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="glass rounded-2xl p-6 md:p-7 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300 reveal group"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{s.icon}</span>
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
