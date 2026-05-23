'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Full-viewport autoplay video banner. Covers 100vh minus navbar height.
 *
 * Browsers only autoplay when:
 *   - the video is muted (or has no audio track), AND
 *   - the user has interacted with the page at least once on this origin, OR
 *   - the page is the active tab.
 *
 * Even with `autoPlay muted playsInline`, autoplay can fail silently after a
 * client-side route change (Next.js doesn't trigger a fresh load). We force
 * a play() call on mount, with a fallback retry, and try again on the first
 * user interaction if the browser blocks autoplay.
 */
export function HeroVideo({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Force properties at the JS level — `autoplay` attribute alone is not
    // always honoured after client-side navigation.
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = true;

    let cancelled = false;

    function tryPlay() {
      if (cancelled || !v) return;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Browser blocked autoplay. Retry on first user interaction.
          const onInteract = () => {
            v.play().catch(() => {});
            window.removeEventListener('pointerdown', onInteract);
            window.removeEventListener('keydown', onInteract);
            window.removeEventListener('scroll', onInteract);
          };
          window.addEventListener('pointerdown', onInteract, { once: true });
          window.addEventListener('keydown', onInteract, { once: true });
          window.addEventListener('scroll', onInteract, { once: true, passive: true });
        });
      }
    }

    const onPlaying = () => setReady(true);
    const onCanPlay = () => tryPlay();
    const onLoadedMeta = () => tryPlay();

    v.addEventListener('playing', onPlaying);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('loadedmetadata', onLoadedMeta);

    // If readyState already advanced before listeners attached, kick off now.
    if (v.readyState >= 2) tryPlay();
    else v.load(); // ensure source is loaded after route change

    // Resume play when tab becomes visible again.
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && v.paused) tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('loadedmetadata', onLoadedMeta);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [videoUrl]);

  return (
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden">
      <video
        // Force a brand-new <video> element per URL so React re-mounts on every
        // route change. Without this, client-side navigation reuses the old DOM
        // node which leaves the video in its paused state.
        key={videoUrl}
        ref={ref}
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {posterUrl && !ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
