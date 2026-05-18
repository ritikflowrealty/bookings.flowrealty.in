import { HeroBuilding } from './HeroBuilding';

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

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-8 lg:pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: copy */}
          <div>
            <h1 className="font-display text-[38px] sm:text-5xl lg:text-7xl leading-[1.02] tracking-tight reveal">
              The address you have
              <br />
              been waiting for.
              <br />
              <span className="neon-text">Yours, in a tap.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-ink-muted leading-relaxed reveal-delayed">
              Hand-picked homes from India&rsquo;s most respected developers. Reserve the unit
              you love today. Our sales team takes it from there.
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-3 reveal-delayed"
              style={{ animationDelay: '240ms' }}
            >
              <a
                href="#projects"
                className="btn-neon transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                See available homes
              </a>
              <a
                href="#why"
                className="btn-ghost transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                Why Choose Us
              </a>
            </div>
          </div>

          {/* Right: building image with lights toggle */}
          <div className="relative reveal-delayed" style={{ animationDelay: '300ms' }}>
            <HeroBuilding />
          </div>
        </div>
      </div>
    </section>
  );
}
