'use client';

import { motion } from 'framer-motion';

type Award = { id: number; title: string; awarding_body: string; year: number; image_url: string };

export function AwardsCarousel({ items }: { items: Award[] }) {
  const tripled = [...items, ...items, ...items];

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-bg to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
      <motion.div
        className="flex gap-5 lg:gap-6"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {tripled.map((a, i) => (
          <AwardTile key={`${a.id}-${i}`} a={a} />
        ))}
      </motion.div>
    </div>
  );
}

function AwardTile({ a }: { a: Award }) {
  return (
    <article
      className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[340px] group relative"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative h-[300px] sm:h-[340px] rounded-[24px] overflow-hidden border border-white/10 backdrop-blur-2xl transition-shadow duration-500 hover:shadow-glow"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        {/* Background image — fills tile, dimmed for glass effect */}
        {a.image_url && (
          <div className="absolute inset-0 transition-opacity duration-700 opacity-100 group-hover:opacity-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.image_url}
              alt={a.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/30 to-bg/95" />
          </div>
        )}

        {/* Decorative neon glow */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.15) 60%, transparent 75%)',
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-lg tabular-nums text-ink-dim">
              {a.year || ''}
            </span>
          </div>

          <div className="mt-auto">
            <h3 className="font-heading uppercase text-lg sm:text-xl leading-[1.1] tracking-tight text-white">
              {a.title}
            </h3>
            <p className="mt-2 text-[11px] sm:text-xs text-ink uppercase tracking-[0.14em]">
              {a.awarding_body}
            </p>
          </div>
        </div>

        {/* Top highlight stroke */}
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
