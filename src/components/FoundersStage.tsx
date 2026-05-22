'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export type FounderStageItem = {
  id: number;
  name: string;
  designation: string;
  cutout_url: string;
  bio: string;
  linkedin_url: string;
  pedigree: string[];
};

const EDU_KEYWORDS = [
  'IIM',
  'NMIMS',
  'NIT',
  'IIT',
  'University',
  'College',
  'School',
  'Institute',
  'Nirma',
  'B-school',
];

function splitPedigree(items: string[]) {
  const education: string[] = [];
  const work: string[] = [];
  for (const item of items) {
    const lower = item.toLowerCase();
    const isEdu = EDU_KEYWORDS.some((k) => lower.includes(k.toLowerCase()));
    if (isEdu) education.push(item);
    else work.push(item);
  }
  return { education, work };
}

export function FoundersStage({ founders }: { founders: FounderStageItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (founders.length === 0) return null;

  return (
    <section className="pt-9 pb-14 lg:pt-12 lg:pb-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl mb-8 lg:mb-10">
          <span className="chip">Leadership</span>
          <h2 className="mt-3 font-heading uppercase text-2xl sm:text-3xl lg:text-4xl tracking-tight">
            People who&rsquo;ve been on both sides.
          </h2>
        </div>

        <div
          className="grid gap-4 lg:gap-5 grid-cols-1 sm:grid-cols-2"
          onMouseLeave={() => setHovered(null)}
        >
          {founders.map((f) => (
            <FounderCard
              key={f.id}
              founder={f}
              isActive={hovered === null ? false : hovered === f.id}
              isDimmed={hovered !== null && hovered !== f.id}
              onHover={() => setHovered(f.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderCard({
  founder: f,
  isActive,
  isDimmed,
  onHover,
}: {
  founder: FounderStageItem;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
}) {
  const { education, work } = splitPedigree(f.pedigree);

  return (
    <div
      onMouseEnter={onHover}
      onFocus={onHover}
      tabIndex={0}
      className="group relative outline-none cursor-pointer"
    >
      {/* Soft halo (no hard border) */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: isActive ? 0.7 : isDimmed ? 0.1 : 0.3,
          scale: isActive ? 1.04 : 0.95,
        }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 -z-10 rounded-[40px] blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(217,46,255,0.55), rgba(255,60,130,0.18) 50%, transparent 75%)',
        }}
      />

      {/* Container — no border */}
      <div className="relative h-[420px] sm:h-[460px] lg:h-[500px] overflow-hidden">
        {/* Portrait — fills container, BW default, color when active */}
        <motion.div
          className="absolute inset-0 flex items-end justify-center"
          initial={false}
          animate={{
            scale: isActive ? 1.04 : isDimmed ? 0.95 : 1,
            y: isActive ? -4 : 0,
            opacity: isDimmed ? 0.55 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={f.cutout_url}
            alt={f.name}
            className="w-full h-full object-contain object-bottom transition-all duration-700"
            style={{
              filter: isActive
                ? 'grayscale(0%) saturate(115%) drop-shadow(0 30px 40px rgba(0,0,0,0.55))'
                : 'grayscale(100%) contrast(105%) drop-shadow(0 18px 25px rgba(0,0,0,0.45))',
            }}
          />
        </motion.div>

        {/* Static name strip (default state) */}
        <AnimatePresence>
          {!isActive && (
            <motion.div
              key="name-strip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isDimmed ? 0.6 : 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 bottom-0 px-5 sm:px-6 pb-5 sm:pb-6 z-10 pointer-events-none"
            >
              <div
                className="rounded-2xl px-4 py-3 backdrop-blur-md text-center"
                style={{ background: 'rgba(8,9,14,0.7)' }}
              >
                <h3 className="font-heading uppercase text-lg sm:text-xl tracking-tight text-white">
                  {f.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-white/85 mt-0.5 uppercase tracking-[0.14em]">
                  {f.designation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail panel (hover state) */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-x-0 bottom-0 px-4 sm:px-5 pb-4 sm:pb-5 z-10"
            >
              <div
                className="rounded-2xl p-4 sm:p-5 backdrop-blur-2xl"
                style={{ background: 'rgba(8,9,14,0.88)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading uppercase text-lg sm:text-xl tracking-tight text-white">
                      {f.name}
                    </h3>
                    <p className="text-[11px] text-neon-magenta mt-0.5 uppercase tracking-wider">
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
                  <p className="mt-3 text-xs sm:text-sm text-ink leading-relaxed line-clamp-4">
                    {f.bio}
                  </p>
                )}

                {(work.length > 0 || education.length > 0) && (
                  <div className="mt-4 space-y-2.5 text-[10px] sm:text-[11px]">
                    {work.length > 0 && (
                      <div>
                        <p className="uppercase tracking-[0.16em] text-ink-dim mb-1.5">
                          Work Experience
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {work.map((p) => (
                            <span
                              key={p}
                              className="px-2.5 py-1 rounded-full uppercase tracking-[0.1em] bg-white/[0.07] border border-white/15 text-white"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {education.length > 0 && (
                      <div>
                        <p className="uppercase tracking-[0.16em] text-ink-dim mb-1.5">
                          Education
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {education.map((p) => (
                            <span
                              key={p}
                              className="px-2.5 py-1 rounded-full uppercase tracking-[0.1em] bg-neon-magenta/15 border border-neon-magenta/40 text-white"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
