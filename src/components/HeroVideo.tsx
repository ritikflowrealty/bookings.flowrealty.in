'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Full-viewport autoplay video banner. Covers 100vh minus navbar height.
 * Video uses object-fit:cover so it fills without distortion on any screen.
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
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden">
      <video
        ref={ref}
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      {posterUrl && !ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Dark overlay for text readability */}
      <div aria-hidden className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}
