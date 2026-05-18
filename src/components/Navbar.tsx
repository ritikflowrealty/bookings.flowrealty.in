'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { useEffect, useState } from 'react';

const links = [
  { href: '#', label: 'Home' },
  { href: '#projects', label: 'Projects' },
  { href: '#why', label: 'Why Choose Us' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-2xl bg-bg/70 border-b border-white/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-[72px] flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          aria-label="Flow Realty"
        >
          <Logo height={32} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative px-4 py-2 rounded-full text-sm text-ink-muted hover:text-ink transition-colors group"
            >
              <span className="relative z-10">{l.label}</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/[0.06] scale-90 group-hover:scale-100 transition-all duration-300"
              />
            </a>
          ))}
          <a
            href="#contact"
            className="btn-neon ml-3 text-sm py-2.5 transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            Contact Us
          </a>
        </nav>

        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl glass active:scale-95 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-bg/90 backdrop-blur-2xl animate-[fadeIn_200ms_ease-out]">
          <div className="px-5 py-4 flex flex-col gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-ink-muted hover:text-ink hover:bg-white/5 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="btn-neon mt-2 transition-transform duration-300 active:scale-95"
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
