'use client';

import { useState } from 'react';
import Image from 'next/image';

const LIGHTS_ON =
  'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/Home%20Page%203d%20Image/lights-ON.png';
const LIGHTS_OFF =
  'https://pub-6cedfcd24b1f4f6abb86ef2df3629236.r2.dev/Home%20Page%203d%20Image/lights-OFF.png';

export function HeroBuilding() {
  const [lightsOn, setLightsOn] = useState(true);

  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto select-none">
      {/* Lights OFF image (always rendered, behind) */}
      <Image
        src={LIGHTS_OFF}
        alt="Home with lights off"
        fill
        sizes="(max-width: 1024px) 80vw, 520px"
        className={`object-contain transition-opacity duration-700 ${
          lightsOn ? 'opacity-0' : 'opacity-100'
        }`}
        priority
      />
      {/* Lights ON image (always rendered, on top) */}
      <Image
        src={LIGHTS_ON}
        alt="Home with lights on"
        fill
        sizes="(max-width: 1024px) 80vw, 520px"
        className={`object-contain transition-opacity duration-700 ${
          lightsOn ? 'opacity-100' : 'opacity-0'
        }`}
        priority
      />

      {/* Bulb toggle button */}
      <button
        onClick={() => setLightsOn((v) => !v)}
        aria-label={lightsOn ? 'Turn lights off' : 'Turn lights on'}
        className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
          lightsOn
            ? 'bg-amber-400/90 shadow-[0_0_24px_rgba(251,191,36,0.7)] hover:shadow-[0_0_36px_rgba(251,191,36,0.9)]'
            : 'glass shadow-card hover:bg-white/[0.08]'
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={lightsOn ? '#1a1a1a' : '#9CA0A8'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Bulb shape */}
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
          {lightsOn && (
            <>
              {/* Rays */}
              <line x1="12" y1="0" x2="12" y2="-1" className="opacity-0" />
            </>
          )}
        </svg>
        {lightsOn && (
          <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/30 pointer-events-none" />
        )}
      </button>
    </div>
  );
}
