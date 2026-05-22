'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Story headline with strike-through animation.
 *
 *   "REAL ESTATE'S #1 CHALLENGE IS  ̶S̶A̶L̶E̶S̶  CASHFLOW."
 *
 * 1. Decoy word fades in
 * 2. Strike line draws across the decoy
 * 3. Reveal word fades in IN-LINE (no line break, no overlap)
 *
 * Both decoy and reveal sit in the SAME inline container so the headline
 * never wraps mid-thought.
 */
export function StoryHeadline({
  prefix = "REAL ESTATE'S #1 CHALLENGE IS",
  decoy = 'SALES',
  reveal = 'CASHFLOW.',
  paragraph,
}: {
  prefix?: string;
  decoy?: string;
  reveal?: string;
  paragraph?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-5xl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="font-heading uppercase text-2xl sm:text-3xl lg:text-5xl tracking-tight leading-[1.1]"
      >
        {prefix}{' '}
        <span className="relative inline-flex items-center align-baseline whitespace-nowrap">
          {/* Decoy: fades in, gets struck through, then fades out */}
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, width: 'auto' }}
            animate={
              inView
                ? { opacity: [0, 1, 1, 0], width: ['auto', 'auto', 'auto', 0] }
                : { opacity: 0 }
            }
            transition={{
              opacity: { duration: 2.4, times: [0, 0.15, 0.55, 0.85], delay: 0.2 },
              width: { duration: 0.4, delay: 2.6, ease: 'easeInOut' },
            }}
            className="overflow-hidden inline-block text-ink-muted relative"
          >
            <span>{decoy}</span>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.45, delay: 1.0, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 origin-left h-[3px] sm:h-[4px] lg:h-[5px] rounded-full"
              style={{
                background: 'linear-gradient(90deg,#7B2EFF,#D92EFF,#FF3C82,#FF6A00)',
              }}
            />
          </motion.span>

          {/* Reveal: fades in inline after strike */}
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.5, delay: 2.5, ease: 'easeOut' }}
            className="ml-3 sm:ml-4 neon-text"
          >
            {reveal}
          </motion.span>
        </span>
      </motion.h2>

      {paragraph && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, delay: 3.0 }}
          className="mt-5 text-base sm:text-lg text-ink leading-relaxed max-w-3xl"
        >
          {paragraph}
        </motion.p>
      )}
    </div>
  );
}
