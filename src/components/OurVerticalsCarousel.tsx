'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationFrame,
  animate,
} from 'framer-motion';

export type Vertical = {
  number: string;
  title: string;
  body: string;
  status: string;
  image: string;
};

const CARD_W = 360; // desktop card width (px)
const CARD_H = 440; // desktop card height (px)
const GAP = 20;

export function OurVerticalsCarousel({ verticals }: { verticals: Vertical[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ left: 0, right: 0 });
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Raw drag value (px). Negative = scrolled right.
  const x = useMotionValue(0);
  // Smoothed value for water-like motion.
  const xSmooth = useSpring(x, { stiffness: 90, damping: 22, mass: 0.5 });

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Compute drag bounds from track size.
  function recalc() {
    const c = containerRef.current;
    const t = trackRef.current;
    if (!c || !t) return;
    const right = 0;
    const left = -(t.scrollWidth - c.clientWidth);
    setBounds({ left: Math.min(0, left), right });
  }
  useEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    if (trackRef.current) ro.observe(trackRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [verticals.length]);

  // Reflect smoothed position to progress bar.
  useAnimationFrame(() => {
    if (bounds.left === 0) return setProgress(0);
    const v = xSmooth.get();
    const p = Math.min(1, Math.max(0, v / bounds.left));
    setProgress(p);
  });

  // Mobile: use native swipe (no JS drag). Just render a simple snap track.
  if (isMobile) return <MobileSwipe verticals={verticals} />;

  if (verticals.length === 0) return null;

  function snapToNearest() {
    const v = xSmooth.get();
    const step = CARD_W + GAP;
    const idx = Math.round(-v / step);
    const target = Math.max(bounds.left, Math.min(0, -idx * step));
    animate(x, target, {
      type: 'spring',
      stiffness: 110,
      damping: 24,
      mass: 0.6,
    });
  }

  return (
    <section id="why-flow" className="py-14 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl mb-8 lg:mb-10">
          <span className="chip">Our Verticals</span>
          <h2 className="mt-3 font-heading uppercase text-2xl sm:text-3xl lg:text-5xl tracking-tight leading-[1.05]">
            Four verticals. Built for every kind of project.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink leading-relaxed">
            Drag across the cards to explore. Each vertical is built for a specific developer
            need.
          </p>
        </div>
      </div>

      {/* Drag area */}
      <div
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={bounds}
          dragElastic={0.08}
          dragMomentum
          dragTransition={{
            power: 0.32,
            timeConstant: 320,
            bounceStiffness: 130,
            bounceDamping: 22,
          }}
          onDragStart={() => {
            // Disconnect spring: while dragging, follow finger 1:1 by writing
            // directly to the motion value the user is dragging.
          }}
          onDragEnd={snapToNearest}
          style={{ x: xSmooth }}
          className="flex gap-5 px-5 lg:pl-[max(2rem,calc((100vw-1280px)/2+2rem))] lg:pr-[max(2rem,calc((100vw-1280px)/2+2rem))] will-change-transform"
        >
          {verticals.map((v, i) => (
            <DesktopCard key={`${v.title}-${i}`} v={v} index={i} xSmooth={xSmooth} />
          ))}
        </motion.div>
      </div>

      {/* Progress strip */}
      <div className="mx-auto max-w-7xl w-full px-5 lg:px-8 mt-5">
        <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${Math.max(8, progress * 100)}%`,
              transition: 'width 60ms linear',
              background: 'linear-gradient(90deg,#7B2EFF,#D92EFF,#FF3C82,#FF6A00)',
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-ink-dim">
          <span>Drag to discover</span>
          <span>{verticals.length} verticals</span>
        </div>
      </div>
    </section>
  );
}

/* Desktop card with subtle parallax + scale-on-focus driven by xSmooth. */
function DesktopCard({
  v,
  index,
  xSmooth,
}: {
  v: Vertical;
  index: number;
  xSmooth: ReturnType<typeof useSpring>;
}) {
  const isComingSoon = (v.status || '').toLowerCase().includes('coming');

  // Each card's center x in track-space:
  const cardCenter = index * (CARD_W + GAP) + CARD_W / 2;
  // Distance of card center from viewport center (approx).
  // We can't know container width here without callback, so fade based on
  // the difference between track translation and card position.
  const scale = useTransform(xSmooth, (v) => {
    const trackOffset = -v;
    const distance = Math.abs(trackOffset - cardCenter + 600); // rough center
    return Math.max(0.94, 1 - distance / 4000);
  });
  const opacity = useTransform(xSmooth, (v) => {
    const trackOffset = -v;
    const distance = Math.abs(trackOffset - cardCenter + 600);
    return Math.max(0.7, 1 - distance / 3000);
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="flex-shrink-0 group relative"
      style={{ width: CARD_W, scale, opacity }}
      draggable={false}
    >
      <div
        className="relative rounded-[24px] overflow-hidden border border-white/10 backdrop-blur-2xl transition-shadow duration-500 hover:shadow-glow"
        style={{
          height: CARD_H,
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
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-40 group-hover:opacity-65 transition-opacity duration-700 pointer-events-none"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        <div className="relative h-full flex flex-col p-6 pointer-events-none">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-lg tabular-nums text-ink-dim">{v.number}</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] border ${
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
            <h3 className="font-heading uppercase text-2xl lg:text-[28px] leading-[1.05] tracking-tight">
              {v.title}
            </h3>
            <p className="mt-2.5 text-sm text-ink leading-relaxed line-clamp-4">{v.body}</p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="absolute top-0 left-5 right-5 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          }}
        />
      </div>
    </motion.article>
  );
}

/* Mobile: native horizontal swipe (smooth on touch already). */
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
    <article className="snap-center flex-shrink-0 w-[80vw] relative">
      <div
        className="relative h-[460px] rounded-[24px] overflow-hidden border border-white/10 backdrop-blur-2xl"
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
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-40"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        <div className="relative h-full flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-lg tabular-nums text-ink-dim">{v.number}</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] border ${
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
            <p className="mt-2.5 text-sm text-ink leading-relaxed">{v.body}</p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="absolute top-0 left-5 right-5 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          }}
        />
      </div>
    </article>
  );
}
