'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export type FounderStageItem = {
  id: number;
  name: string;
  designation: string;
  cutout_url: string; // transparent-background portrait
  bio: string;
  linkedin_url: string;
  pedigree: string[]; // institutions/companies relevant to THIS founder only
};

/**
 * Founders stage: 3D cutout portraits with hover reveal.
 * - Default: black & white, slightly tilted, scaled down.
 * - Hover/focus: color, lifted in 3D, info card slides in.
 * Designed for transparent-background PNG cutouts (e.g. R2-hosted).
 *
 * Recommended cutout size: 1200x1500 px (4:5 portrait), transparent PNG, < 800 KB.
 */
export function FoundersStage({ founders }: { founders: FounderStageItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (founders.length === 0) return null;

  return (
    <section className="relative py-14 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <span className="chip">Leadership</span>
          <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            People who&rsquo;ve been on both sides.
          </h2>
        </div>

        <div
          className={`mt-10 grid gap-6 lg:gap-8 ${
            founders.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 md:grid-cols-2'
          }`}
          style={{ perspective: '1400px' }}
        >
          {founders.map((f) => {
            const isActive = hovered === f.id;
            return (
              <div
                key={f.id}
                onMouseEnter={() => setHovered(f.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(f.id)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                className="group relative outline-none"
              >
                {/* Glow halo */}
                <motion.div
                  aria-hidden="true"
                  initial={false}
                  animate={{
                    opacity: isActive ? 0.7 : 0.25,
                    scale: isActive ? 1.05 : 0.92,
                  }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 -z-10 rounded-[40px] blur-3xl"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(217,46,255,0.5), rgba(255,60,130,0.25) 50%, transparent 75%)',
                  }}
                />

                {/* Stage card */}
                <div
                  className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 backdrop-blur-md min-h-[440px] sm:min-h-[520px] flex"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Portrait */}
                  <motion.div
                    className="absolute inset-0 flex items-end justify-center"
                    initial={false}
                    animate={{
                      rotateY: isActive ? -6 : 0,
                      rotateX: isActive ? 4 : 0,
                      scale: isActive ? 1.05 : 1,
                      y: isActive ? -8 : 0,
                    }}
                    transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.cutout_url}
                      alt={f.name}
                      className="w-full h-full object-contain object-bottom transition-all duration-700"
                      style={{
                        filter: isActive
                          ? 'grayscale(0%) saturate(115%) drop-shadow(0 30px 40px rgba(0,0,0,0.55))'
                          : 'grayscale(100%) contrast(105%) drop-shadow(0 20px 30px rgba(0,0,0,0.5))',
                      }}
                    />
                  </motion.div>

                  {/* Info reveal — slides up from bottom */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.4 }}
                        className="absolute left-0 right-0 bottom-0 p-5 sm:p-6 z-10"
                      >
                        <div
                          className="rounded-2xl p-5 backdrop-blur-2xl border border-white/15"
                          style={{ background: 'rgba(8, 9, 14, 0.78)' }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-heading uppercase text-xl sm:text-2xl tracking-tight">
                                {f.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-neon-purple mt-0.5">
                                {f.designation}
                              </p>
                            </div>
                            {f.linkedin_url && (
                              <a
                                href={f.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                aria-label={`${f.name} on LinkedIn`}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                              </a>
                            )}
                          </div>
                          {f.bio && (
                            <p className="mt-3 text-sm text-ink-muted leading-relaxed line-clamp-4">
                              {f.bio}
                            </p>
                          )}
                          {f.pedigree.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {f.pedigree.map((p) => (
                                <span
                                  key={p}
                                  className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.12em] bg-white/[0.06] border border-white/10 text-ink-muted"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Static name strip (when not hovered) */}
                  {!isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="absolute left-0 right-0 bottom-0 p-5 sm:p-6 z-10 pointer-events-none"
                    >
                      <div className="text-center">
                        <h3 className="font-heading uppercase text-xl sm:text-2xl tracking-tight">
                          {f.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{f.designation}</p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-ink-dim mt-3">
                          Hover to know more
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
