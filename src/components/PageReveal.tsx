'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Triggers a smooth slide-up + fade animation every time the route changes,
 * giving the SPA-like "Rustomjee feeling" where pages don't appear to fully
 * reload — content rises from the bottom into place.
 *
 * Wrap the children of the layout's <body> with this.
 */
export function PageReveal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      return;
    }
    // Reset
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(36px)';
    // Force reflow then animate
    void el.offsetHeight;
    el.style.transition = 'opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)';
    requestAnimationFrame(() => {
      if (!el) return;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, [pathname]);

  return (
    <div ref={ref} style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  );
}
