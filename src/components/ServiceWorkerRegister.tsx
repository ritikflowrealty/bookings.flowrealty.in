'use client';

import { useEffect } from 'react';

/**
 * Registers /sw.js silently on every page load.
 * The service worker caches the hero video on first visit and serves it
 * from local cache on subsequent visits (stale-while-revalidate).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Don't block paint — schedule registration after first frame.
    const idle =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => setTimeout(cb, 200));

    idle(() => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silent. Service worker is a best-effort enhancement.
      });
    });
  }, []);

  return null;
}
