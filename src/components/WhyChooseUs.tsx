const items = [
  {
    title: 'Provisional in 60 seconds',
    body: 'Pick a project, share a few details, secure your unit. No paperwork, no waiting.',
  },
  {
    title: 'Confirmed by humans',
    body: 'Our sales team reviews every booking and reaches out within 24 hours to walk you through next steps.',
  },
  {
    title: 'Razorpay secured checkout',
    body: 'PCI compliant payments routed to each developer\'s own Razorpay account. We never store card data.',
  },
  {
    title: 'Cities covered',
    body: 'Bengaluru and Mysuru live today. Bhubaneswar and Hyderabad coming soon.',
  },
];

export function WhyChooseUs() {
  return (
    <section id="why" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <span className="chip">Why Choose Us</span>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
            A booking experience built for modern home buyers.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((it, i) => (
            <div
              key={it.title}
              className="glass rounded-2xl p-6 md:p-8 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-start gap-4">
                <span
                  className="mt-1 inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-semibold"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(123,46,255,0.25), rgba(255,60,130,0.25))',
                    color: '#F5F5F5',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl">{it.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{it.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
