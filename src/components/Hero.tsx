export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* glow blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(123,46,255,0.6), rgba(123,46,255,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-40 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,106,0,0.45), rgba(255,60,130,0) 70%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 grid-bg" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-16">
        <span className="chip">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse-slow" />
          Live · Provisional Booking Open
        </span>
        <h1 className="mt-5 font-display text-[44px] sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          Find your dream home
          <br />
          <span className="neon-text">in 60 seconds.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base sm:text-lg text-ink-muted leading-relaxed">
          Premium residences across Bangalore and Mysuru. Pick a project, fill a short form, and
          secure your unit through a verified Razorpay checkout. Our sales team confirms within 24
          hours.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#projects" className="btn-neon">Explore Projects</a>
          <a href="#why" className="btn-ghost">Why Flow Realty</a>
        </div>

        <div className="mt-10 flex items-center gap-3 text-xs text-ink-dim">
          <span className="chip">TLS 1.2+</span>
          <span className="chip">Razorpay Secured</span>
          <span className="chip">No Card Data Stored</span>
        </div>
      </div>
    </section>
  );
}
