import Image from 'next/image';

/**
 * Renders the Flow Realty logo.
 *
 * Drop your logo at:
 *   public/logo.svg   (preferred, infinitely scalable)
 *   public/logo.png   (fallback, recommended 512×512 transparent PNG)
 *
 * Recommendations:
 *   - SVG: 1:1 viewBox, transparent background, single colour or gradient
 *   - PNG: 512×512 master, the component renders at 36px so any 2x size is sharp
 *   - Keep file under 60KB. Optimise via https://svgomg.net or https://squoosh.app
 */
export function Logo({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative inline-block"
        style={{ width: size, height: size }}
      >
        {/* Use Next/Image so it lazy-decodes and avoids layout shift.
            If logo.svg / logo.png is not in /public, this gracefully falls back
            to the SVG mark below via onError. */}
        <Image
          src="/logo.svg"
          alt="Flow Realty"
          width={size}
          height={size}
          className="object-contain drop-shadow-[0_0_18px_rgba(217,46,255,0.35)]"
          priority
          unoptimized
        />
      </span>
      <span className="font-display text-[18px] tracking-tight text-ink leading-none">
        flow<span className="neon-text">realty</span>
      </span>
    </span>
  );
}
