import Link from 'next/link';

import { SectionReveal } from './SectionReveal';

/**
 * "Join the flow" call-to-action — points to the careers page.
 *
 * Used as the closing block on the team page (and anywhere else that wants a
 * recruiting nudge). Keep the visual language matched to the rest of the site:
 * glass card, neon gradient accent, uppercase heading.
 */
export function JoinFlowCta({
  eyebrow = 'Careers at Flow',
  title = 'Join the flow.',
  body = 'We are always hiring sharp people in sales, marketing, customer success, technology, operations, and finance. If you want to build the engine behind India\u2019s biggest residential launches, tell us about yourself.',
  href = '/careers',
  ctaLabel = 'View open roles',
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  href?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionReveal>
          <div className="relative glass-strong rounded-[32px] overflow-hidden">
            {/* Soft neon halo behind the card */}
            <div
              aria-hidden="true"
              className="absolute -inset-x-20 -top-32 h-72 blur-3xl opacity-60 pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(217,46,255,0.45), rgba(255,60,130,0.18) 50%, transparent 75%)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -right-24 h-72 w-72 blur-3xl opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(123,46,255,0.4), rgba(255,106,0,0.18) 50%, transparent 75%)',
              }}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-10 lg:p-14">
              <div className="lg:col-span-7">
                <span className="chip">{eyebrow}</span>
                <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05]">
                  {title.split('flow').length > 1 ? (
                    <>
                      {title.split('flow')[0]}
                      <span className="neon-text">flow</span>
                      {title.split('flow').slice(1).join('flow')}
                    </>
                  ) : (
                    title
                  )}
                </h2>
                <p className="mt-4 text-ink leading-relaxed max-w-xl">{body}</p>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3 lg:items-end">
                <Link href={href} className="btn-neon w-full sm:w-auto justify-center">
                  {ctaLabel}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <p className="text-xs text-ink-dim text-center lg:text-right">
                  Two-minute application. CV upload included.
                </p>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
