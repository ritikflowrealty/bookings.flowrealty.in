'use client';

import { useState, useMemo } from 'react';
import { ProjectTile } from './ProjectTile';
import type { PublicProject } from '@/lib/projects';

export function ProjectsSection({ projects }: { projects: PublicProject[] }) {
  const cities = useMemo(() => {
    const set = new Set(projects.map((p) => p.city));
    return ['All', ...Array.from(set).sort()];
  }, [projects]);

  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? projects : projects.filter((p) => p.city === active);

  return (
    <section id="projects" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <span className="chip">Projects</span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
              Homes our families call their own.
            </h2>
          </div>
        </div>

        {/* City filter */}
        {cities.length > 2 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setActive(city)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  active === city
                    ? 'bg-neon-gradient text-white shadow-glow'
                    : 'glass text-ink-muted hover:text-ink hover:bg-white/[0.06]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-12 glass rounded-3xl p-12 text-center">
            <p className="text-ink-muted">
              No projects are live right now. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
            {filtered.map((p, i) => (
              <ProjectTile key={p.id} project={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
