'use client';

import { motion } from 'framer-motion';

type Testimonial = {
  id: number;
  client_name: string;
  designation: string;
  company: string;
  photo_url: string;
  quote: string;
};

export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const tripled = [...items, ...items, ...items];

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-bg to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
      <motion.div
        className="flex gap-6 py-4"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {tripled.map((t, i) => (
          <article
            key={`${t.id}-${i}`}
            className="flex-shrink-0 w-[320px] sm:w-[380px] glass-strong rounded-3xl p-6 flex flex-col hover:shadow-glow transition-shadow"
          >
            {/* Quote mark */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-neon-magenta/60">
              <path d="M9.583 17.321C8.553 16.227 8 15 8 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C18.553 16.227 18 15 18 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" transform="translate(-4 0)"/>
            </svg>
            <p className="mt-4 text-sm sm:text-base text-ink leading-relaxed flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/10">
              {t.photo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={t.photo_url}
                  alt={t.client_name}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-neon-gradient flex items-center justify-center text-xs font-bold text-white">
                  {t.client_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium uppercase tracking-wide">{t.client_name}</p>
                <p className="text-[11px] text-ink-dim">
                  {t.designation}
                  {t.company ? `, ${t.company}` : ''}
                </p>
              </div>
            </div>
          </article>
        ))}
      </motion.div>
    </div>
  );
}
