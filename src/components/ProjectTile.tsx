'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import type { PublicProject } from '@/lib/projects';

export function ProjectTile({ project, index }: { project: PublicProject; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  const bookingDisabled = !project.booking_enabled;

  return (
    <article
      className="tile-3d group"
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        ref={ref}
        className="tile-3d-inner relative overflow-hidden rounded-3xl glass-strong shadow-card hover:shadow-glow"
        style={{
          transform:
            'perspective(1200px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)',
        }}
      >
        {/* image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {project.image_url ? (
            <Image
              src={project.image_url}
              alt={`${project.name} by ${project.developer}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority={index < 3}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neon-purple/30 via-neon-magenta/20 to-neon-orange/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

          {project.highlight_text && (
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.12em] bg-neon-gradient text-white shadow-glow">
              {project.highlight_text}
            </span>
          )}

          <span className="absolute top-4 right-4 chip">{project.city}</span>
        </div>

        {/* content */}
        <div className="p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            {project.developer}
          </p>
          <h3 className="mt-1 font-display text-2xl text-ink leading-tight">{project.name}</h3>
          {project.description && (
            <p className="mt-2 text-sm text-ink-muted line-clamp-2">{project.description}</p>
          )}

          <div className="mt-5 flex items-center gap-3">
            {bookingDisabled ? (
              <span className="btn-ghost cursor-not-allowed opacity-60">Booking Closed</span>
            ) : (
              <Link href={`/book/${project.slug}`} className="btn-neon text-sm">
                Book Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
            {project.learn_more_url && (
              <a
                href={project.learn_more_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm"
              >
                Learn More
              </a>
            )}
          </div>
        </div>

        {/* glow border */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5 group-hover:ring-neon-magenta/40 transition"
        />
      </div>
    </article>
  );
}
