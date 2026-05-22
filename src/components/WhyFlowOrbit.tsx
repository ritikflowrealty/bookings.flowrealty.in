'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export type Vertical = {
  number: string;
  title: string;
  body: string;
  status: string;
  image: string;
};

export function WhyFlowOrbit({ verticals }: { verticals: Vertical[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  function update() {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    setProgress(p);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('article');
    const step = card
      ? (card as HTMLElement).offsetWidth + 24 // card + gap
      : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  if (verticals.length === 0) return null;

  return (
    <section id="why-flow" className="py-12 lg:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-8 lg:mb-10">
          <div className="max-w-2xl">
            <span className="chip">Our Verticals</span>
            <h2 className="mt-3 font-heading uppercase text-2xl sm:text-3xl lg:text-5xl tracking-tight leading-[1.05]">
              Four verticals. Built for every kind of project.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink leading-relaxed">
              Each vertical is built for a specific developer need.
            </p>
          </div>

          {/* Desktop arrow controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="Previous vertical"
              className="w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label="Next vertical"
              className="w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Single horizontal snap track for all viewports */}
      <div
        ref={trackRef}
        className="overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 [scrollbar-width:none]"
      >
        <div className="flex gap-5 lg:gap-6 px-5 lg:pl-[max(2rem,calc((100vw-1280px)/2+2rem))] lg:pr-[max(2rem,calc((100vw-1280px)/2+2rem))]">
          {verticals.map((v, i) => (
            <VerticalCard key={`${v.title}-${i}`} v={v} index={i} />
          ))}
        </div>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Progress strip */}
      <div className="mx-auto max-w-7xl w-full px-5 lg:px-8 mt-5">
        <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full transition-[width] duration-200"
            style={{
              width: `${Math.max(8, progress * 100)}%`,
              background: 'linear-gradient(90deg,#7B2EFF,#D92EFF,#FF3C82,#FF6A00)',
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-ink-dim">
          <span className="md:hidden">Swipe to discover</span>
          <span className="hidden md:inline">Drag or use arrows</span>
          <span>{verticals.length} verticals</span>
        </div>
      </div>
    </section>
  );
}

function VerticalCard({ v, index }: { v: Vertical; index: number }) {
  const isComingSoon = (v.status || '').toLowerCase().includes('coming');

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="snap-start flex-shrink-0 w-[80vw] sm:w-[60vw] md:w-[440px] lg:w-[460px] group relative"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative h-[480px] sm:h-[500px] lg:h-[520px] rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-2xl transition-shadow duration-500 hover:shadow-glow"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.18] group-hover:opacity-30 transition-opacity duration-700">
          {v.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={v.image} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/20 to-bg/85" />
        </div>

        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        <div className="relative h-full flex flex-col p-6 lg:p-8">
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
            <h3 className="font-heading uppercase text-2xl sm:text-3xl lg:text-[34px] leading-[1.05] tracking-tight">
              {v.title}
            </h3>
            <p className="mt-3 text-sm sm:text-base text-ink leading-relaxed">{v.body}</p>
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
    </motion.article>
  );
}
