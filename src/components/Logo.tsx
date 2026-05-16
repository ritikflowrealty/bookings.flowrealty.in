/**
 * Inline SVG logo. Renders a flowing gradient mark so it stays sharp at any size
 * and never depends on an external image being present.
 */
export function Logo({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="drop-shadow-[0_0_18px_rgba(217,46,255,0.45)]"
      >
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B2EFF" />
            <stop offset="50%" stopColor="#D92EFF" />
            <stop offset="100%" stopColor="#FF6A00" />
          </linearGradient>
        </defs>
        <path
          d="M14 14 C 28 14, 36 22, 50 22 C 50 30, 42 30, 32 30 C 22 30, 14 30, 14 38 C 28 38, 36 46, 50 46"
          stroke="url(#lg)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="font-display text-[18px] tracking-tight text-ink">
        flow<span className="neon-text">realty</span>
      </span>
    </span>
  );
}
