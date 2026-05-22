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
        className="flex gap-6"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {tripled.map((a, i) => (
          <article
            key={`${a.id}-${i}`}
            className="flex-shrink-0 w-[360px] sm:w-[420px] lg:w-[460px] glass-strong rounded-3xl p-6 sm:p-7 flex gap-5 hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/[0.04] flex items-center justify-center overflow-hidden">
              {a.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={a.image_url} alt="" className="w-full h-full object-contain" />
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-neon-magenta">
                  <path d="M6 9a6 6 0 0012 0M6 9V3h12v6M9 21h6m-3-3v3m0-3a4 4 0 01-4-4V8h8v6a4 4 0 01-4 4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="font-heading uppercase text-base sm:text-lg leading-tight tracking-tight text-white">
                {a.title}
              </p>
              <p className="mt-2 text-[11px] sm:text-xs text-ink-muted uppercase tracking-[0.14em]">
                {a.awarding_body}
                {a.year ? ` · ${a.year}` : ''}
              </p>
            </div>
          </article>
        ))}
      </motion.div>
    </div>
  );
}
