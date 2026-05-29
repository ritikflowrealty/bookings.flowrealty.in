/**
 * Site-wide ambient background — "Flow" themed.
 *
 * Sits behind every page so the whole site reads as a brand-coloured
 * environment instead of flat black. Three layers:
 *
 *   1. Three vivid neon blooms (violet, magenta, orange) — the brand palette
 *      laid out so they drift across the visible area, not just the corners.
 *   2. Five flowing SVG curves that traverse the viewport with animated
 *      stroke-dashoffsets, like neon currents. This is the "Flow" cue.
 *   3. A faint masked grid so the page still reads as engineered, not soupy.
 *
 * Pure CSS + a single inline SVG. No images, no JS. `pointer-events: none`
 * everywhere. Honours `prefers-reduced-motion`.
 */
export function SiteAmbience() {
  return (
    <div
      aria-hidden="true"
      className="site-ambience pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Layer 1: three bright drifting neon blooms */}
      <div className="ambience-bloom ambience-bloom--violet" />
      <div className="ambience-bloom ambience-bloom--magenta" />
      <div className="ambience-bloom ambience-bloom--orange" />

      {/* Layer 2: animated flowing SVG curves — the "Flow" motif */}
      <svg
        className="ambience-flow"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flowGradA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7B2EFF" stopOpacity="0" />
            <stop offset="35%" stopColor="#7B2EFF" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#D92EFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF3C82" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flowGradB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3C82" stopOpacity="0" />
            <stop offset="40%" stopColor="#FF3C82" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#FF6A00" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flowGradC" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7B2EFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#D92EFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7B2EFF" stopOpacity="0" />
          </linearGradient>
          <filter id="flowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Five long sweeping curves at different vertical positions and
            speeds. Each is drawn as a stroked bezier; the dasharray makes it
            visible as a moving comet of light along the line. */}
        <g filter="url(#flowGlow)">
          <path
            className="flow-line flow-line--1"
            d="M -200,180 C 300,80 600,300 900,180 S 1400,260 1800,140"
            stroke="url(#flowGradA)"
          />
          <path
            className="flow-line flow-line--2"
            d="M -200,420 C 200,520 500,320 900,420 S 1400,520 1800,400"
            stroke="url(#flowGradB)"
          />
          <path
            className="flow-line flow-line--3"
            d="M -200,640 C 250,520 600,720 900,620 S 1400,540 1800,680"
            stroke="url(#flowGradC)"
          />
          <path
            className="flow-line flow-line--4"
            d="M -200,300 C 350,360 700,200 1000,320 S 1450,400 1800,260"
            stroke="url(#flowGradA)"
          />
          <path
            className="flow-line flow-line--5"
            d="M -200,780 C 300,700 700,860 1100,760 S 1500,820 1800,720"
            stroke="url(#flowGradB)"
          />
        </g>
      </svg>

      {/* Layer 3: faint masked grid */}
      <div className="ambience-grid" />

      {/* Layer 4: light vignette */}
      <div className="ambience-vignette" />
    </div>
  );
}
