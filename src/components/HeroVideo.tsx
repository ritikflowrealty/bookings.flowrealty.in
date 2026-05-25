'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Full-viewport autoplay video banner. Covers 100vh minus navbar height.
 *
 * Speed strategy:
 *  - Show the poster at full opacity from frame 1, so the user never sees a
 *    black hole during buffer.
 *  - Flip the video to visible on `loadeddata` (first frame decoded) instead
 *    of waiting for `playing` (full motion confirmed).
 *  - Force `play()` on every meaningful event, with retries.
 *  - Fall back to first user interaction if the browser blocks autoplay.
 */
export function HeroVideo({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

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

    const onLoadedData = () => {
      setHasFrame(true);
      tryPlay();
    };
    const onCanPlay = () => tryPlay();
    const onLoadedMeta = () => tryPlay();
    const onPlaying = () => setHasFrame(true);

    v.addEventListener('loadeddata', onLoadedData);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('loadedmetadata', onLoadedMeta);
    v.addEventListener('playing', onPlaying);

    if (v.readyState >= 2) {
      onLoadedData();
    } else {
      v.load();
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && v.paused) tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      v.removeEventListener('loadeddata', onLoadedData);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('loadedmetadata', onLoadedMeta);
      v.removeEventListener('playing', onPlaying);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [videoUrl]);

  return (
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden bg-bg">
      {/* Poster shown immediately at full opacity. Hides only once a video
          frame is on screen, so there is never a flash of empty space. */}
      {posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            hasFrame ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      <video
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
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          hasFrame ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
