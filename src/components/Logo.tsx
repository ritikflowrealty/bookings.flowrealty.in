import Image from 'next/image';
import Link from 'next/link';

const NATURAL_W = 270;
const NATURAL_H = 100;
const RATIO = NATURAL_W / NATURAL_H;

/**
 * Brand logo. Reads /public/logo.png (wide wordmark, 270x100 source).
 * Renders at the requested height and computes width from the natural ratio.
 */
export function Logo({
  className = '',
  height = 36,
  asLink = false,
}: {
  className?: string;
  height?: number;
  asLink?: boolean;
}) {
  const w = Math.round(height * RATIO);
  const inner = (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Flow Realty"
        width={w * 2}
        height={height * 2}
        sizes={`${w}px`}
        style={{ width: w, height }}
        className="object-contain drop-shadow-[0_0_22px_rgba(217,46,255,0.25)]"
        priority
      />
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" aria-label="Flow Realty home" className="inline-flex items-center">
        {inner}
      </Link>
    );
  }
  return inner;
}
