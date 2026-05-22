'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

type Vertical = {
  number: string;
  title: string;
  body: string;
  status: 'Ongoing Projects' | 'Coming Soon';
  image: string;
};

const VERTICALS: Vertical[] = [
  {
    number: '01',
    title: 'Flow Exclusive',
    body: 'Marketing, sales, and collections outsourcing on an exclusive basis for projects that need an acceleration in their cashflows.',
    status: 'Ongoing Projects',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80&auto=format&fit=crop',
  },
  {
    number: '02',
    title: 'Terra by Flow',
    body: 'Empowering developers with a 360 degree online way of sales and marketing for Plotted Developments.',
    status: 'Ongoing Projects',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80&auto=format&fit=crop',
  },
  {
    number: '03',
    title: 'Flow Luxe',
    body: 'Boutique luxury retail service designed to provide international-standard realtor services to HNI home buyers.',
    status: 'Coming Soon',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80&auto=format&fit=crop',
  },
  {
    number: '04',
    title: 'Flow Manage',
    body: 'An end-to-end DM solution for land owners or young developers wanting to outsource their entire value chain from product planning to construction management.',
    status: 'Coming Soon',
    image:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1000&q=80&auto=format&fit=crop',
  },
];

export function WhyFlowOrbit() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('article');
    const step = card ? (card as HTMLElement).offsetWidth + 24 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  return (
    <section id="why-flow" className="py-14 lg:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-10 lg:mb-14">
          <div className="max-w-2xl">
            <span className="chip">Why Flow?</span>
            <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              Four verticals. Built for every kind of project.
            </h2>
            <p className="mt-3 text-ink-muted leading-relaxed">
              From an exclusive sales mandate to plotted-development specialists, luxury concierge,
              and end-to-end DM, our verticals meet developers where they are.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous vertical"
              className="w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Next vertical"
              className="w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal slide track */}
      <div
        ref={trackRef}
        className="overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ scrollPaddingLeft: '24px', scrollPaddingRight: '24px' }}
      >
        <div className="flex gap-6 px-5 lg:pl-[max(2rem,calc((100vw-1280px)/2+2rem))] lg:pr-[max(2rem,calc((100vw-1280px)/2+2rem))]">
          {VERTICALS.map((v, i) => (
            <VerticalCard key={v.number} v={v} index={i} />
          ))}
        </div>
      </div>

      <style jsx>{`
        section :global(div::-webkit-scrollbar) {
          display: none;
        }
      `}</style>
    </section>
  );
}

function VerticalCard({ v, index }: { v: Vertical; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isComingSoon = v.status === 'Coming Soon';

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: x * 6, y: -y * 6 });
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="snap-start flex-shrink-0 w-[88%] sm:w-[75%] md:w-[460px] lg:w-[480px] group relative"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative h-[460px] sm:h-[500px] lg:h-[520px] rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-2xl transition-shadow duration-500 hover:shadow-glow"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background image — subtle, dimmed for glass look */}
        <div className="absolute inset-0 opacity-[0.18] group-hover:opacity-30 transition-opacity duration-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/20 to-bg/85" />
        </div>

        {/* Decorative neon glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-7 lg:p-8">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-xl tabular-nums text-ink-dim">{v.number}</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] border ${
                isComingSoon
                  ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
                  : 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isComingSoon ? 'bg-amber-300' : 'bg-emerald-300'
                } ${isComingSoon ? '' : 'animate-pulse'}`}
              />
              {v.status}
            </span>
          </div>

          <div className="mt-auto">
            <h3 className="font-heading uppercase text-2xl sm:text-3xl lg:text-[34px] leading-[1.05] tracking-tight">
              {v.title}
            </h3>
            <p className="mt-4 text-sm sm:text-base text-ink-muted leading-relaxed">{v.body}</p>
          </div>
        </div>

        {/* Top highlight stroke for glass feel */}
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
