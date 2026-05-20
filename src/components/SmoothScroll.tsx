'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Global smooth-scroll using Lenis. Mount once at the root of the app.
 * Inertia, easing and direction emulate the Rustomjee experience.
 *
 * Honours `prefers-reduced-motion` automatically.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.1,
      wheelMultiplier: 1,
      syncTouch: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Honour anchor navigation
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"], a[href*="/#"]');
      if (!target) return;
      const href = (target as HTMLAnchorElement).getAttribute('href') || '';
      const hash = href.startsWith('#') ? href : href.includes('#') ? '#' + href.split('#')[1] : '';
      if (!hash || hash === '#') return;
      const el = document.querySelector(hash);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -72 });
        history.pushState(null, '', href);
      }
    }
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
