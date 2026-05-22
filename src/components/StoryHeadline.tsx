'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Headline:  "REAL ESTATE'S #1 CHALLENGE IS  SALES → CASHFLOW."
 * - Initial state on page load: full headline visible with "SALES."
 * - On scroll into view: a neon strike-line draws across SALES, then
 *   SALES fades out and CASHFLOW. fades in IN-PLACE (same grid cell).
 * - No width animation, no margin gap, no line break — both words
 *   stack in a single CSS grid cell so the layout never shifts.
 */
export function StoryHeadline({
  prefix = "REAL ESTATE'S #1 CHALLENGE IS",
  decoy = 'SALES.',
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
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-5xl">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl lg:text-5xl tracking-tight leading-[1.1]">
        {prefix}{' '}
        <span className="inline-grid align-baseline">
          {/* Decoy "SALES." — visible by default, struck-through on scroll-in */}
          <motion.span
            className="row-start-1 col-start-1 relative whitespace-nowrap"
            initial={{ opacity: 1 }}
            animate={inView ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1, ease: 'easeOut' }}
            aria-hidden={inView}
          >
            <span className="text-ink-muted">{decoy}</span>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 origin-left h-[3px] sm:h-[4px] lg:h-[5px] rounded-full"
              style={{
                background: 'linear-gradient(90deg,#7B2EFF,#D92EFF,#FF3C82,#FF6A00)',
              }}
            />
          </motion.span>

          {/* Reveal "CASHFLOW." — fades in after the strike completes */}
          <motion.span
            className="row-start-1 col-start-1 neon-text whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.3, ease: 'easeOut' }}
          >
            {reveal}
          </motion.span>
        </span>
      </h2>

      {paragraph && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="mt-5 text-base sm:text-lg text-ink leading-relaxed max-w-3xl"
        >
          {paragraph}
        </motion.p>
      )}
    </div>
  );
}
