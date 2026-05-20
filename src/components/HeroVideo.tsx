'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Autoplay HD background video with poster fallback. Muted is enforced because
 * browsers block autoplay with audio. Falls back to the building image
 * component if no video is configured.
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
    const onPlaying = () => setReady(true);
    v.addEventListener('playing', onPlaying);
    return () => v.removeEventListener('playing', onPlaying);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl">
      <video
        ref={ref}
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`w-full h-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {posterUrl && !ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent pointer-events-none" />
    </div>
  );
}
