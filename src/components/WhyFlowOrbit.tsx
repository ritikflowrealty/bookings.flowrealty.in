'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Vertical = {
  number: string;
  title: string;
  body: string;
  icon: string; // emoji-style mark
};

const VERTICALS: Vertical[] = [
  {
    number: '01',
    title: 'Sales Acceleration',
    body: 'End-to-end sales execution from launch to last mile. Walk-ins, conversions, closures.',
    icon: '⚡',
  },
  {
    number: '02',
    title: 'Strategy & Pricing',
    body: 'Market positioning, inventory management, and pricing that moves units without leaving money on the table.',
    icon: '◆',
  },
  {
    number: '03',
    title: 'Creative & Digital',
    body: 'Performance marketing, content, and creative that generates qualified leads at scale.',
    icon: '✦',
  },
  {
    number: '04',
    title: 'Channel Partner Synergy',
    body: '1000+ CP network activated per project. Onboarding, training, incentive design.',
    icon: '◈',
  },
  {
    number: '05',
    title: 'CRM & Tech',
    body: 'Lead management, walk-in tracking, conversion analytics. Real-time dashboards for developers.',
    icon: '◉',
  },
  {
    number: '06',
    title: 'Terra by Flow',
    body: 'Specialised vertical for plotted developments. Land monetisation and plot sales execution.',
    icon: '◎',
  },
];

/**
 * Why Flow? — verticals on a slowly rotating orbit around a glowing center.
 * Hover a tile to pause rotation and reveal its description.
 * Falls back to a stacked horizontal scroll on mobile.
 */
export function WhyFlowOrbit() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 600, r: 230 });

  useEffect(() => {
    function resize() {
      const el = stageRef.current;
      if (!el) return;
      const w = el.clientWidth;
      // Keep stage square; cap at 760px on huge screens
      const stageW = Math.min(w, 760);
      const stageH = stageW;
      const r = stageW * 0.38; // orbit radius
      setSize({ w: stageW, h: stageH, r });
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section id="why-flow" className="py-14 lg:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-10 lg:mb-14">
          <div className="max-w-2xl">
            <span className="chip">Why Flow?</span>
            <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              Six verticals. One outcome. Sold-out projects.
            </h2>
            <p className="mt-3 text-ink-muted leading-relaxed">
              Hover any vertical to learn how each piece of the engine moves units.
            </p>
          </div>
        </div>

        {/* Desktop: orbit */}
        <div className="hidden md:flex justify-center">
          <div
            ref={stageRef}
            className="relative w-full max-w-[760px]"
            style={{ height: size.h, perspective: '1400px' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
              setPaused(false);
              setActiveIdx(null);
            }}
          >
            {/* orbit rings — purely decorative */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full border border-white/[0.06]"
                style={{ width: size.r * 2, height: size.r * 2 }}
              />
              <div
                className="absolute rounded-full border border-white/[0.04]"
                style={{ width: size.r * 2 + 60, height: size.r * 2 + 60 }}
              />
              <div
                className="absolute rounded-full border border-dashed border-white/[0.05]"
                style={{ width: size.r * 2 - 70, height: size.r * 2 - 70 }}
              />
            </div>

            {/* Center node */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ width: 180, height: 180 }}
            >
              <div className="relative w-full h-full">
                <motion.div
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.25) 60%, transparent 75%)',
                  }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute inset-3 rounded-full glass-strong border border-white/15 flex flex-col items-center justify-center text-center px-4">
                  <span className="font-heading uppercase text-sm tracking-[0.2em] text-ink-dim">
                    Flow
                  </span>
                  <span className="mt-1 font-heading uppercase text-2xl tracking-tight neon-text">
                    Realty
                  </span>
                  <span className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                    Sales as a Service
                  </span>
                </div>
              </div>
            </div>

            {/* Rotating ring of tiles */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: paused ? undefined : 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              style={{ originX: 0.5, originY: 0.5 }}
            >
              {VERTICALS.map((v, i) => {
                const angle = (i / VERTICALS.length) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * size.r;
                const y = Math.sin(angle) * size.r;
                const isActive = activeIdx === i;
                return (
                  <motion.button
                    key={v.number}
                    type="button"
                    onMouseEnter={() => setActiveIdx(i)}
                    onFocus={() => setActiveIdx(i)}
                    onClick={() => setActiveIdx(i)}
                    className="absolute left-1/2 top-1/2 group focus:outline-none"
                    style={{
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                      width: 130,
                      height: 130,
                    }}
                  >
                    {/* Counter-rotate so tile content stays upright */}
                    <motion.div
                      className="w-full h-full"
                      animate={{ rotate: paused ? 0 : -360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    >
                      <div
                        className={`relative w-full h-full rounded-2xl flex flex-col items-center justify-center text-center px-3 transition-all duration-500 ${
                          isActive
                            ? 'glass-strong shadow-glow scale-110 ring-1 ring-neon-magenta/40'
                            : 'glass hover:bg-white/[0.08]'
                        }`}
                        style={{
                          backdropFilter: 'blur(18px)',
                          WebkitBackdropFilter: 'blur(18px)',
                        }}
                      >
                        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                          {v.number}
                        </span>
                        <span
                          className={`mt-1 text-2xl ${isActive ? 'neon-text' : 'text-ink-muted'}`}
                          aria-hidden="true"
                        >
                          {v.icon}
                        </span>
                        <span className="mt-1 font-heading uppercase text-[11px] leading-tight tracking-tight">
                          {v.title}
                        </span>
                      </div>
                    </motion.div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Active vertical detail (center bottom of orbit, fades in on hover) */}
            <motion.div
              key={activeIdx ?? 'idle'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: activeIdx !== null ? 1 : 0, y: activeIdx !== null ? 0 : 16 }}
              transition={{ duration: 0.4 }}
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-full max-w-md px-4 pointer-events-none"
            >
              {activeIdx !== null && (
                <div className="glass-strong rounded-2xl p-4 text-center backdrop-blur-2xl">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-dim">
                    {VERTICALS[activeIdx].number}
                  </p>
                  <h3 className="mt-1 font-heading uppercase text-lg tracking-tight">
                    {VERTICALS[activeIdx].title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {VERTICALS[activeIdx].body}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Mobile fallback: glassy horizontal scroll cards */}
        <div className="md:hidden -mx-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          <div className="flex gap-4 px-5">
            {VERTICALS.map((v) => (
              <article
                key={v.number}
                className="snap-start flex-shrink-0 w-[78%] glass-strong rounded-3xl p-6"
              >
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-dim">
                  {v.number}
                </span>
                <span className="block mt-2 text-2xl neon-text" aria-hidden="true">
                  {v.icon}
                </span>
                <h3 className="mt-2 font-heading uppercase text-lg tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
