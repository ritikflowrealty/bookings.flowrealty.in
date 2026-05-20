import { getSettings, setting } from '@/lib/settings';

export async function WhyChooseUs() {
  const s = await getSettings();
  const salesValue = setting(s, 'total_sales_value', '3500');
  const salesUnit = setting(s, 'total_sales_unit', 'Cr');
  const years = setting(s, 'years_active', '5');
  const cpSize = setting(s, 'cp_distribution_size', '1000');
  const teamSize = setting(s, 'team_size', '75');

  const items = [
    {
      title: 'Vetted by sales experts',
      body: `We partner directly with India's leading developers across active projects. Every home on this page is one our team has walked, priced, and approved before you ever see it.`,
    },
    {
      title: 'Backed by performance',
      body: `Over ₹${salesValue} ${salesUnit} in residential sales delivered in the last ${years} years. The projects we list are projects that move. The developers we work with deliver.`,
    },
    {
      title: 'Reserve in seconds',
      body: 'Pick a unit. Pay the booking amount through Razorpay or Cashfree. Done. No paperwork, no waiting in a sales office, no follow-up calls before you even decide.',
    },
    {
      title: 'A team that calls back',
      body: `Our ${teamSize}-strong team from Tier-A brands and B-schools picks up the phone. You get a single point of contact who walks you through site visits, paperwork, and possession.`,
    },
    {
      title: `${cpSize}+ channel partner network`,
      body: 'India\'s largest CP distribution. The home you book is also one a thousand brokers tracked, tried, and ranked.',
    },
    {
      title: 'Built for the way you buy',
      body: 'Most real-estate sites give you listings. We give you a verified shortlist, a transparent price, and a way to commit instantly when you find the one.',
    },
  ];

  return (
    <section id="why" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <span className="chip">Why Choose Us</span>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
            Where serious buyers find serious homes.
          </h2>
          <p className="mt-4 text-ink-muted leading-relaxed">
            Flow Realty curates the projects worth your time. The result is a smaller list, but
            every name on it is one our sales partners stand behind.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
          {items.map((it, i) => (
            <div
              key={it.title}
              className="glass rounded-2xl p-6 md:p-7 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col reveal"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-semibold mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(123,46,255,0.25), rgba(255,60,130,0.25))',
                  color: '#F5F5F5',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                0{i + 1}
              </span>
              <h3 className="font-display text-xl">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
