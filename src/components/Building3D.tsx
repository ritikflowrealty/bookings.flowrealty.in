'use client';

import { useEffect, useRef, useState } from 'react';

const MODEL_URL =
  'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/models/model.glb';

/**
 * 3D building model viewer.
 * - Horizontal auto-rotate (no vertical orbit so base stays hidden)
 * - Toggle button for building lights (exposure control)
 * - Uses Google's <model-viewer> web component (lightweight, GPU-accelerated)
 * - Lazy-loaded: only fetches the model when the component is in viewport
 */
export function Building3D() {
  const [lightsOn, setLightsOn] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLElement>(null);

  // Lazy load: only mount model-viewer when container enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    import('@google/model-viewer').catch(() => {});
  }, [inView]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[340px] lg:min-h-[460px] flex items-center justify-center"
    >
      {inView && (
        <>
          {/* @ts-ignore - model-viewer is a custom element */}
          <model-viewer
            ref={ref}
            src={MODEL_URL}
            alt="3D building model"
            loading="eager"
            auto-rotate=""
            auto-rotate-delay="0"
            rotation-per-second="12deg"
            camera-orbit="0deg 75deg 105%"
            min-camera-orbit="auto 70deg auto"
            max-camera-orbit="auto 80deg auto"
            camera-controls=""
            disable-zoom=""
            interaction-prompt="none"
            exposure={lightsOn ? '1.2' : '0.3'}
            shadow-intensity={lightsOn ? '1' : '0.2'}
            shadow-softness="0.8"
            environment-image="neutral"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '340px',
              background: 'transparent',
              outline: 'none',
              // @ts-ignore
              '--poster-color': 'transparent',
              '--progress-bar-color': '#7B2EFF',
            }}
            onLoad={() => setLoaded(true)}
          />

          {/* Lights toggle */}
          <button
            onClick={() => setLightsOn((v) => !v)}
            className={`absolute bottom-4 right-4 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              lightsOn
                ? 'bg-neon-gradient text-white shadow-glow'
                : 'glass text-ink-muted hover:text-ink'
            }`}
            aria-label={lightsOn ? 'Turn lights off' : 'Turn lights on'}
          >
            {lightsOn ? '💡 Lights On' : '🌙 Lights Off'}
          </button>
        </>
      )}

      {/* Loading state */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-neon-purple border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
