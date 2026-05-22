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
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  function update() {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    setProgress(p);
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

  // Desktop click-and-drag-to-scroll. Mobile keeps native touch swipe.
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only enable drag on non-touch pointers (mouse, pen)
    if (e.pointerType === 'touch') return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
    el.style.scrollBehavior = 'auto'; // disable smooth during drag for 1:1 feel
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    el.scrollLeft = drag.current.startScroll - dx;
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = trackRef.current;
    if (!el) return;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = 'grab';
    el.style.scrollBehavior = 'smooth'; // re-enable smooth so snap settles
    // Trigger snap re-alignment
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.max(0, Math.min(max, el.scrollLeft)), behavior: 'smooth' });
  }

  if (verticals.length === 0) return null;

  return (
    <section id="why-flow" className="py-12 lg:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl mb-8 lg:mb-10">
          <span className="chip">Our Verticals</span>
          <h2 className="mt-3 font-heading uppercase text-2xl sm:text-3xl lg:text-5xl tracking-tight leading-[1.05]">
            Four verticals. Built for every kind of project.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink leading-relaxed">
            Swipe or drag across the cards to explore. Each vertical is built for a specific
            developer need.
          </p>
        </div>
      </div>

      {/* Single horizontal snap track — touch swipe on mobile, mouse-drag on desktop */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 [scrollbar-width:none] select-none cursor-grab"
        style={{ touchAction: 'pan-x' }}
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
          <span>Swipe or drag</span>
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
      // Prevent images from being draggable (would interfere with our drag-scroll)
      draggable={false}
    >
      <div
        className="relative h-[480px] sm:h-[500px] lg:h-[520px] rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-2xl transition-shadow duration-500 hover:shadow-glow"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.18] group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
          {v.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={v.image}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/20 to-bg/85" />
        </div>

        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        <div className="relative h-full flex flex-col p-6 lg:p-8 pointer-events-none">
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
          className="absolute top-0 left-6 right-6 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          }}
        />
      </div>
    </motion.article>
  );
}
