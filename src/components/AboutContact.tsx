export function AboutContact() {
  return (
    <section id="contact" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* About */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <span className="chip">About Flow Realty</span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
              Modern homes, backed by a sales team that picks up the phone.
            </h2>
            <p className="mt-5 text-ink-muted leading-relaxed">
              Flow Realty curates premium residential projects from trusted developers across South
              India. We have helped families secure their homes across Bengaluru and Mysuru with a
              process designed to be quick, transparent, and respectful of your time.
            </p>
            <p className="mt-3 text-ink-muted leading-relaxed">
              Every booking on this page is provisional. Once you pay through Razorpay, our sales
              team reviews the details and reaches out within 24 hours with confirmation, site
              visit options, and next steps.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">Bengaluru</span>
              <span className="chip">Mysuru</span>
              <span className="chip">Bhubaneswar</span>
              <span className="chip">Hyderabad · soon</span>
            </div>
          </div>

          {/* Contact cards on the right */}
          <div className="lg:col-span-5 grid gap-4">
            <a
              href="tel:+918012345678"
              className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group"
            >
              <p className="label">Call us</p>
              <p className="mt-2 font-display text-2xl">+91 80 1234 5678</p>
              <p className="text-xs text-ink-dim mt-1">Mon to Sat, 9 AM to 7 PM</p>
            </a>
            <a
              href="mailto:hello@flowrealty.in"
              className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-colors"
            >
              <p className="label">Email</p>
              <p className="mt-2 font-display text-2xl">hello@flowrealty.in</p>
              <p className="text-xs text-ink-dim mt-1">Replies within 2 hours</p>
            </a>
            <div className="glass rounded-2xl p-6">
              <p className="label">Visit</p>
              <p className="mt-2 font-display text-2xl">Richards Town, Bangalore</p>
              <p className="text-xs text-ink-dim mt-1">3rd Floor, Clarke Road</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
