# Flow Realty Design System

This is the visual contract every page in the project conforms to. When in doubt, read this first.

## 1. Visual Theme & Atmosphere

**Tone:** Premium, futuristic, calm. A real estate brand that feels like a fintech.

**Mood keywords:** dark luxury, neon clarity, minimal energy, considered motion.

**One-line definition:** _Modern dark canvas, neon gradient accents, editorial typography, smooth motion that rises from the bottom._

## 2. Color Palette

```css
:root {
  /* Backgrounds */
  --bg: #0B0B0F;
  --bg-soft: #111114;
  --bg-card: #16161B;
  --bg-graphite: #1F1F26;

  /* Neon gradient stops */
  --neon-purple: #7B2EFF;
  --neon-magenta: #D92EFF;
  --neon-pink: #FF3C82;
  --neon-orange: #FF6A00;
  --neon-blue: #00AEEF;

  /* Ink (text) */
  --ink: #F5F5F5;
  --ink-muted: #9CA0A8;
  --ink-dim: #6B6F78;

  /* Gradients */
  --neon-gradient: linear-gradient(135deg, #7B2EFF 0%, #D92EFF 35%, #FF3C82 65%, #FF6A00 100%);
}
```

**Roles:**
- Page background: `--bg` everywhere
- Cards / glass surfaces: 4-6% white over `--bg`
- Primary CTA: `--neon-gradient` background + white text
- Secondary CTA: 1px white-10 border, white-3 fill, white text
- Body text: `--ink-muted`
- Headings: `--ink` (or `neon-text` class for one-word emphasis)

## 3. Typography

- **Display (headings):** Fraunces (Google Fonts), weights 400-700
- **Body:** Onest (Google Fonts), weights 400-700
- **Loaded via** `next/font/google` in `layout.tsx`

**Scale:**
| Use | Size | Weight | Letter spacing |
|-----|------|--------|---------------|
| H1 | 44–88px | 600 | -0.03em |
| H2 | 32–48px | 600 | -0.02em |
| H3 | 24–28px | 500 | -0.01em |
| Body | 14-18px | 400 | 0 |
| Label | 11px | 500 | 0.18em uppercase |

**Rule:** Use `font-display` (Fraunces) only on H1, H2, hero numbers, and quotes. Everything else uses `font-sans` (Onest).

## 4. Components

Pre-built classes in `globals.css`:
- `.btn-neon` — primary CTA
- `.btn-ghost` — secondary CTA
- `.glass` / `.glass-strong` — surfaces
- `.input` — form input
- `.label` — uppercase label
- `.chip` — small badge/pill
- `.neon-text` — gradient text

Every interactive element must have hover, focus, and active states.

## 5. Layout

- Container: `mx-auto max-w-7xl px-5 lg:px-8`
- Section vertical padding: `py-20 lg:py-28`
- Card radius: `rounded-3xl` (24px)
- Spacing scale: 4 / 8 / 16 / 24 / 40 / 56 / 80 / 112

## 6. Motion (Rustomjee-style)

**Global:**
- Smooth scroll via Lenis (`SmoothScroll` component mounted in layout)
- Page transitions: content rises from bottom 36px + fades in over 700ms

**Per-section:**
- Wrap any new section in `<SectionReveal>` to get IntersectionObserver-based reveal
- Direct children of `.reveal-section` stagger in by 80ms

**Per-element:**
- Buttons: `transition-transform 300ms` + `hover:scale-105 active:scale-95`
- Cards: `transition-shadow 500ms` + `hover:shadow-glow`
- Images: place inside `.zoom-hover` wrapper for slow zoom on parent hover

**Hero text:** use `.text-mask-reveal` for a clip-up word reveal on H1.

**Reduced motion:** all reveal CSS auto-degrades to instant via `prefers-reduced-motion`.

## 7. Depth & Elevation

- `shadow-card`: subtle drop, used on glass cards
- `shadow-glow`: neon purple glow used on CTA hover and 3D tile hover

## 8. Do's and Don'ts

**Do:**
- Use `<SectionReveal>` around every new section so it rises into view
- Use `<Link>` from `next/link` for all internal navigation (SmoothScroll handles anchor hashes)
- Compose buttons from `.btn-neon` and `.btn-ghost`
- Keep card content vertically `flex-col h-full` so equal-height grids stay equal

**Don't:**
- Don't hardcode hex colors — use Tailwind tokens that map to CSS variables
- Don't introduce Framer Motion or GSAP for simple reveals — IntersectionObserver + CSS transitions are enough
- Don't use `filter: blur()` on moving elements (kills FPS on mobile)
- Don't put more than one heavy 3D scene on a page
- Don't break grid alignment by using fixed pixel widths inside a card body

## 9. Responsive

- Mobile breakpoint: `< 768px` (single column, smaller padding)
- Tablet: `md:` (768-1024)
- Desktop: `lg:` (1024+)
- Touch targets: min 44×44px
- Test on iPhone SE (375), iPhone 14 (390), iPad (768), 1440 desktop

## 10. SEO Architecture

Every public page must include:
- Unique `<title>` (max 60 chars, include "| Flow Realty")
- Unique meta description (max 160 chars)
- Canonical URL
- Schema.org JSON-LD: LocalBusiness on home, RealEstateListing on project pages, BreadcrumbList on subpages, FAQPage where FAQs exist
- OpenGraph + Twitter card images

URL structure follows `/<city>/<modifier>/` for landing pages:
- `/bangalore/flats-in-sarjapur-road/`
- `/bangalore/3-bhk-flats-in-bangalore/`
- `/bangalore/properties-under-1-crore-in-bangalore/`

Sitemap auto-generated from CMS in `app/sitemap.ts`.
