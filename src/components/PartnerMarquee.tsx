'use client';

import { motion } from 'framer-motion';

type Partner = { id: number; name: string; logo_url: string };

export function PartnerMarquee({
  partners,
  reverse = false,
  duration = 40,
}: {
  partners: Partner[];
  reverse?: boolean;
  duration?: number;
}) {
  if (partners.length === 0) return null;
  const items = [...partners, ...partners, ...partners];

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-bg to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
      <motion.div
        className="flex gap-6"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="flex-shrink-0 h-20 sm:h-24 w-44 sm:w-52 rounded-2xl glass flex items-center justify-center px-5 transition-all hover:scale-[1.03] hover:bg-white/[0.07]"
          >
            {p.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.logo_url}
                alt={p.name}
                className="max-h-12 sm:max-h-14 w-auto object-contain"
                style={{ filter: 'grayscale(80%) brightness(1.4)' }}
              />
            ) : (
              <span className="text-sm font-medium text-ink-muted whitespace-nowrap text-center uppercase tracking-wider">
                {p.name}
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
