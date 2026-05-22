import { HeroBuilding } from './HeroBuilding';
import { HeroVideo } from './HeroVideo';
import { getSettings, setting } from '@/lib/settings';

export async function Hero() {
  const s = await getSettings();
  const videoUrl = setting(s, 'hero_video_url');
  const posterUrl = setting(s, 'hero_video_poster');
  const headline = setting(s, 'hero_headline', 'The address you have been waiting for. Yours, in a tap.');
  const subheadline = setting(
    s,
    'hero_subheadline',
    'Hand-picked homes from India\'s most respected developers. Reserve the unit you love today. Our sales team takes it from there.'
  );

  // Full-viewport video banner mode — no overlay, buttons at bottom
  if (videoUrl) {
    return (
      <section className="relative">
        <HeroVideo videoUrl={videoUrl} posterUrl={posterUrl} />
        {/* Buttons positioned at the bottom of the video */}
        <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 flex flex-wrap items-center justify-center gap-3 sm:gap-4 pointer-events-auto z-10 px-5">
          <a
            href="/projects"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium text-white text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md"
            style={{ background: 'rgba(123, 46, 255, 0.18)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            See available homes
          </a>
          <a
            href="/#why-flow"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium text-white text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md"
            style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            Our Verticals
          </a>
        </div>
      </section>
    );
  }

  // Fallback: split layout with building image
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(123,46,255,0.6), rgba(123,46,255,0) 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-40 w-[640px] h-[640px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(255,106,0,0.45), rgba(255,60,130,0) 70%)' }}
      />
      <div aria-hidden="true" className="absolute inset-0 grid-bg" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-8 lg:pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <h1 className="font-display text-[38px] sm:text-5xl lg:text-7xl leading-[1.02] tracking-tight reveal">
              {renderHeadline(headline)}
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-ink-muted leading-relaxed reveal-delayed">
              {subheadline}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 reveal-delayed" style={{ animationDelay: '240ms' }}>
              <a href="/projects" className="btn-neon transition-transform duration-300 hover:scale-105 active:scale-95">
                See available homes
              </a>
              <a href="/#why-flow" className="btn-ghost transition-transform duration-300 hover:scale-105 active:scale-95">
                Our Verticals
              </a>
            </div>
          </div>
          <div className="relative reveal-delayed max-h-[460px] aspect-square mx-auto w-full" style={{ animationDelay: '300ms' }}>
            <HeroBuilding />
          </div>
        </div>
      </div>
    </section>
  );
}

function renderHeadline(h: string) {
  const parts = h.split('.');
  if (parts.length <= 1) return h;
  const last = parts[parts.length - 2].trim() + '.';
  const rest = parts.slice(0, -2).map((p) => p.trim() + '.').join(' ');
  return (
    <>
      {rest && <>{rest}<br /></>}
      <span className="neon-text">{last}</span>
    </>
  );
}

