'use client';

import { useEffect, useRef } from 'react';

/**
 * IntersectionObserver-based reveal. Children rise from the bottom with a
 * staggered fade as the section enters viewport. Drop this around any section
 * to get the Rustomjee-style scroll storytelling.
 *
 * Stagger child elements by adding `.reveal-child` to direct children.
 */
export function SectionReveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.classList.add('is-revealed');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Delay can be passed via prop or via data-reveal-delay on the el
            window.setTimeout(() => {
              el.classList.add('is-revealed');
            }, delay);
            io.unobserve(el);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  // @ts-ignore – ref typing across polymorphic Tag
  return (
    // @ts-ignore
    <Tag ref={ref} className={`reveal-section ${className}`}>
      {children}
    </Tag>
  );
}
