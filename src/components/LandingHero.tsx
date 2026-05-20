import { SectionReveal } from './SectionReveal';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';

export function LandingHero({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  highlightWord,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumbs: Crumb[];
  highlightWord?: string;
}) {
  // Split title to wrap last word in neon if highlightWord provided
  let firstPart = title;
  let highlight = '';
  if (highlightWord && title.endsWith(highlightWord)) {
    firstPart = title.slice(0, title.length - highlightWord.length).trim();
    highlight = highlightWord;
  }

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(123,46,255,0.6), rgba(123,46,255,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-40 w-[640px] h-[640px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(255,106,0,0.45), rgba(255,60,130,0) 70%)',
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-10 pb-12">
        <Breadcrumbs items={breadcrumbs} />
        <SectionReveal className="mt-5">
          <span className="chip">{eyebrow}</span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            {firstPart}
            {highlight && (
              <>
                {' '}
                <span className="neon-text">{highlight}</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-ink-muted leading-relaxed">
            {subtitle}
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
