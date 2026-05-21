'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Animated story headline.
 * Renders a hard-coded "challenge is X" headline where X starts as a struck-through
 * decoy word and reveals the real word with a draw-on strike line.
 *
 * Default: "REAL ESTATE'S #1 CHALLENGE IS [SALES] CASHFLOW."
 *  - "SALES" appears first, then a horizontal strike line draws across it.
 *  - "CASHFLOW." reveals after the strike completes.
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
      <h2 className="font-heading uppercase text-3xl sm:text-4xl lg:text-6xl tracking-tight leading-[1.05]">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="block"
        >
          {prefix}{' '}
          <span className="relative inline-block whitespace-nowrap">
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: [0, 1, 1, 0.5] } : { opacity: 0 }}
              transition={{ duration: 1.6, times: [0, 0.2, 0.55, 1], delay: 0.3 }}
              className="text-ink-muted"
              aria-hidden="true"
            >
              {decoy}
            </motion.span>
            {/* Strike-through line draws across the decoy word */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.55, delay: 1.1, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 origin-left h-[3px] sm:h-[4px] lg:h-[6px] rounded-full"
              style={{ background: 'linear-gradient(90deg,#7B2EFF,#D92EFF,#FF3C82,#FF6A00)' }}
            />
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.7, delay: 1.6, ease: 'easeOut' }}
              className="absolute left-0 -bottom-[1.05em] sm:-bottom-[1.15em] lg:-bottom-[1.1em] whitespace-nowrap neon-text"
            >
              {reveal}
            </motion.span>
          </span>
        </motion.span>
      </h2>
      {/* Spacer so the absolutely positioned reveal word doesn't overlap */}
      <div className="h-[1.2em] sm:h-[1.3em] lg:h-[1.2em]" aria-hidden="true" />
      {paragraph && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.7, delay: 2.1 }}
          className="mt-8 text-lg text-ink-muted leading-relaxed max-w-3xl"
        >
          {paragraph}
        </motion.p>
      )}
    </div>
  );
}
