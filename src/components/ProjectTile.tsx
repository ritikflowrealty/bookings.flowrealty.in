'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PublicProject } from '@/lib/projects';

/**
 * Card-as-link pattern: the whole tile is one anchor. This makes the click
 * target unambiguous (no z-index, no hit-test races, no mobile-tap dead zones).
 * The "Learn More" stays as a sibling anchor that stops propagation so it can
 * open in a new tab without conflicting with the main link.
 */
export function ProjectTile({ project, index }: { project: PublicProject; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(true); // start as touch so SSR matches mobile

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setIsTouch(!mql.matches);
    update();
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  }, []);

  function onMouseMove(e: React.MouseEvent) {
    if (isTouch) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 4).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  const bookingDisabled = !project.booking_enabled;
  const cardHref = bookingDisabled ? '#' : `/book/${project.slug}`;

  return (
    <article
      className="group relative h-full reveal"
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* The main link covers the whole card. */}
      <Link
        href={cardHref}
        prefetch={false}
        aria-disabled={bookingDisabled}
        onClick={(e) => {
          if (bookingDisabled) e.preventDefault();
        }}
        className={`block h-full rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-neon-magenta/60 ${
          bookingDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        <div
          ref={ref}
          className="relative h-full flex flex-col overflow-hidden rounded-3xl glass-strong shadow-card transition-transform duration-500 will-change-transform group-hover:shadow-glow"
          style={
            isTouch
              ? undefined
              : {
                  transform:
                    'perspective(1200px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
                }
          }
        >
          {/* image */}
          <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
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
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent pointer-events-none" />

            {project.highlight_text && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.12em] bg-neon-gradient text-white shadow-glow pointer-events-none">
                {project.highlight_text}
              </span>
            )}

            <span className="absolute top-4 right-4 chip pointer-events-none">{project.city}</span>
          </div>

          {/* content */}
          <div className="p-6 flex-1 flex flex-col">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              {project.developer}
            </p>
            <h3 className="mt-1 font-display text-2xl text-ink leading-tight">{project.name}</h3>
            <p className="mt-2 text-sm text-ink-muted line-clamp-2 min-h-[2.5rem]">
              {project.description || ' '}
            </p>

            {/* Visual call-to-action. Decorative; the parent link handles navigation. */}
            <div className="mt-auto pt-5 flex items-center gap-3 flex-wrap">
              <span
                className={
                  bookingDisabled
                    ? 'btn-ghost text-sm opacity-60 select-none'
                    : 'btn-neon text-sm pointer-events-none'
                }
                aria-hidden="true"
              >
                {bookingDisabled ? 'Booking Closed' : 'Book Now'}
                {!bookingDisabled && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </div>
          </div>

          {/* glow border — never blocks clicks */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5 group-hover:ring-neon-magenta/40 transition"
          />
        </div>
      </Link>

      {/* Learn More: separate sibling anchor, sits above the card link */}
      {project.learn_more_url && (
        <a
          href={project.learn_more_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-6 bottom-6 btn-ghost text-xs px-4 py-2"
          style={{ touchAction: 'manipulation' }}
        >
          Learn More
        </a>
      )}
    </article>
  );
}
