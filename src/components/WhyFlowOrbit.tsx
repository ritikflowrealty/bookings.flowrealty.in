'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export type Vertical = {
  number: string;
  title: string;
  body: string;
  status: string;
  image: string;
};

export function WhyFlowOrbit({ verticals }: { verticals: Vertical[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  if (verticals.length === 0) return null;

  return isMobile ? (
    <MobileSwipe verticals={verticals} />
  ) : (
    <DesktopScroll verticals={verticals} />
  );
}

/* ---------- Desktop: scroll-driven horizontal reveal ----------
   Total scroll budget = (N tiles × 1 viewport) + 3 extra viewports of hold
   on the last tile so the user can read it before the section releases.
*/
function DesktopScroll({ verticals }: { verticals: Vertical[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Each card occupies 1 viewport of scroll. Last card gets a 3-viewport hold.
  const HOLD_VIEWPORTS = 3;
  const totalViewports = verticals.length + HOLD_VIEWPORTS;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Translate the row from 0 to "show last card" only across the FIRST
  // (N-1) / (N-1+HOLD) of the scroll. The remaining range keeps the row
  // parked on the last card (the "hold").
  const transitionEnd = (verticals.length - 1) / (verticals.length - 1 + HOLD_VIEWPORTS);
  const finalX = `-${(verticals.length - 1) * 100}%`;

  const x = useTransform(
    scrollYProgress,
    [0, transitionEnd, 1],
    ['0%', finalX, finalX]
  );

  return (
    <section
      id="why-flow"
      ref={containerRef}
      className="relative"
      style={{ height: `${totalViewports * 100}vh` }}
    >
      <div className="sticky top-[72px] h-[calc(100vh-72px)] flex flex-col overflow-hidden pt-10 lg:pt-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 mb-6 lg:mb-8">
          <span className="chip">Our Verticals</span>
          <h2 className="mt-3 font-heading uppercase text-2xl sm:text-3xl lg:text-5xl tracking-tight leading-[1.05]">
            Four verticals. Built for every kind of project.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink leading-relaxed max-w-2xl">
            Scroll to explore. Each vertical is built for a specific developer need.
          </p>
        </div>

        {/* The carousel — one card centered at a time */}
        <div className="flex-1 flex items-center overflow-hidden">
          <motion.div
            style={{ x }}
            className="flex will-change-transform"
          >
            {verticals.map((v, i) => (
              <DesktopCard key={`${v.title}-${i}`} v={v} />
            ))}
          </motion.div>
        </div>

        {/* Progress strip */}
        <div className="mx-auto max-w-7xl w-full px-5 lg:px-8 mt-4 mb-6">
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full origin-left"
              style={{
                scaleX: scrollYProgress,
                background: 'linear-gradient(90deg,#7B2EFF,#D92EFF,#FF3C82,#FF6A00)',
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            <span>Scroll to discover</span>
            <span>{verticals.length} verticals</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Desktop card: each card claims 100vw so translateX(-100%, -200%, ...) snaps
   one card per viewport. Inner content is centered with padding. */
function DesktopCard({ v }: { v: Vertical }) {
  const isComingSoon = (v.status || '').toLowerCase().includes('coming');

  return (
    <article className="flex-shrink-0 w-screen px-8 lg:px-16 flex justify-center">
      <div
        className="relative w-full max-w-[760px] h-[58vh] min-h-[420px] max-h-[560px] rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-2xl group"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-25 transition-opacity duration-700 group-hover:opacity-40">
          {v.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={v.image} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/55 via-bg/15 to-bg/85" />
        </div>

        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-50"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        <div className="relative h-full flex flex-col p-8 lg:p-10">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-2xl tabular-nums text-ink-dim">{v.number}</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] border ${
                isComingSoon
                  ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
                  : 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isComingSoon ? 'bg-amber-300' : 'bg-emerald-300 animate-pulse'
                }`}
              />
              {v.status}
            </span>
          </div>

          <div className="mt-auto">
            <h3 className="font-heading uppercase text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
              {v.title}
            </h3>
            <p className="mt-4 text-base lg:text-lg text-ink leading-relaxed max-w-2xl">{v.body}</p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="absolute top-0 left-8 right-8 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          }}
        />
      </div>
    </article>
  );
}

/* ---------- Mobile: native horizontal swipe ---------- */
function MobileSwipe({ verticals }: { verticals: Vertical[] }) {
  return (
    <section id="why-flow" className="py-10 overflow-hidden">
      <div className="px-5 mb-6">
        <span className="chip">Our Verticals</span>
        <h2 className="mt-3 font-heading uppercase text-2xl tracking-tight leading-[1.05]">
          Four verticals. Built for every kind of project.
        </h2>
        <p className="mt-2 text-sm text-ink leading-relaxed">
          Swipe to explore. Each vertical is built for a specific developer need.
        </p>
      </div>

      <div className="overflow-x-auto snap-x snap-mandatory pb-3 [scrollbar-width:none]">
        <div className="flex gap-4 px-5">
          {verticals.map((v, i) => (
            <MobileCard key={`${v.title}-${i}`} v={v} />
          ))}
        </div>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      <div className="px-5 mt-3 flex items-center gap-1.5">
        {verticals.map((_, i) => (
          <span key={i} className="flex-1 h-[2px] rounded-full bg-white/15" />
        ))}
      </div>
    </section>
  );
}

function MobileCard({ v }: { v: Vertical }) {
  const isComingSoon = (v.status || '').toLowerCase().includes('coming');

  return (
    <article
      className="snap-center flex-shrink-0 w-[80vw] relative"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative h-[480px] rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-2xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.22]">
          {v.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={v.image} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/55 via-bg/15 to-bg/85" />
        </div>

        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        <div className="relative h-full flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-xl tabular-nums text-ink-dim">{v.number}</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] border ${
                isComingSoon
                  ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
                  : 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isComingSoon ? 'bg-amber-300' : 'bg-emerald-300 animate-pulse'
                }`}
              />
              {v.status}
            </span>
          </div>

          <div className="mt-auto">
            <h3 className="font-heading uppercase text-2xl leading-[1.05] tracking-tight">
              {v.title}
            </h3>
            <p className="mt-3 text-sm text-ink leading-relaxed">{v.body}</p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="absolute top-0 left-6 right-6 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          }}
        />
      </div>
    </article>
  );
}
