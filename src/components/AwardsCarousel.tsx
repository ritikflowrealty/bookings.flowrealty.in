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
        className="flex gap-5"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {tripled.map((a, i) => (
          <article
            key={`${a.id}-${i}`}
            className="flex-shrink-0 w-[280px] sm:w-[320px] glass rounded-3xl p-6 flex gap-4 hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center overflow-hidden">
              {a.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={a.image_url} alt="" className="w-full h-full object-contain" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neon-magenta">
                  <path d="M6 9a6 6 0 0012 0M6 9V3h12v6M9 21h6m-3-3v3m0-3a4 4 0 01-4-4V8h8v6a4 4 0 01-4 4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display text-base leading-tight uppercase tracking-tight">
                {a.title}
              </p>
              <p className="mt-1.5 text-[11px] text-ink-dim uppercase tracking-[0.12em]">
                {a.awarding_body}{a.year ? ` · ${a.year}` : ''}
              </p>
            </div>
          </article>
        ))}
      </motion.div>
    </div>
  );
}
