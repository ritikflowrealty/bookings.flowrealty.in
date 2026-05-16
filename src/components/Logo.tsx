import Image from 'next/image';
import Link from 'next/link';

/**
 * Brand logo. Reads /public/logo.png (1024×1024 square, transparent PNG).
 *
 * If you ever swap to SVG: drop logo.svg next to logo.png and change the src below.
 */
export function Logo({
  className = '',
  size = 38,
  asLink = false,
}: {
  className?: string;
  size?: number;
  asLink?: boolean;
}) {
  const img = (
    <Image
      src="/logo.png"
      alt="Flow Realty"
      width={size * 2}
      height={size * 2}
      sizes={`${size}px`}
      style={{ width: size, height: size }}
      className="object-contain drop-shadow-[0_0_22px_rgba(217,46,255,0.35)]"
      priority
    />
  );

  const inner = (
    <span className={`inline-flex items-center ${className}`}>
      <span className="relative inline-block" style={{ width: size, height: size }}>
        {img}
      </span>
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
