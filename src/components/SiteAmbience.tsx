/**
 * Site-wide ambient background layer.
 *
 * Sits at the bottom of the z-stack (`-z-10`) and behind every page so the
 * whole site stops feeling like a flat black slab. Pure CSS — no images, no
 * JS, no extra network requests. Three layers:
 *
 *   1. Two large neon radial blooms (magenta + violet/orange) softly drifting.
 *   2. A faint grid mask vignetted to the centre.
 *   3. A super-subtle SVG noise grain to kill banding on the gradients.
 *
 * `pointer-events-none` so it never interferes with clicks. Honours
 * `prefers-reduced-motion` by freezing the drift animations.
 */
export function SiteAmbience() {
  return (
    <div
      aria-hidden="true"
      className="site-ambience pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Layer 1: two slow-drifting neon blooms */}
      <div className="ambience-bloom ambience-bloom--a" />
      <div className="ambience-bloom ambience-bloom--b" />

      {/* Layer 2: faint grid, masked to centre so edges fade out */}
      <div className="ambience-grid" />

      {/* Layer 3: light noise to break up gradient banding */}
      <div className="ambience-noise" />

      {/* Layer 4: deep vignette so cards near the edges still feel grounded */}
      <div className="ambience-vignette" />
    </div>
  );
}
