'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/team', label: 'Team' },
  { href: '/projects', label: 'Projects' },
  { href: '/case-studies', label: 'Work' },
  { href: '/news', label: 'Insights' },
];

const enquireOptions = [
  { href: '/enquire?as=developer', label: 'Developer', sub: 'Project mandate' },
  { href: '/enquire?as=cp', label: 'Channel Partner', sub: 'Submit leads' },
  { href: '/enquire?as=buyer', label: 'Home Buyer', sub: 'Find a home' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const pathname = usePathname();
  const enquireRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setEnquireOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!enquireRef.current) return;
      if (!enquireRef.current.contains(e.target as Node)) setEnquireOpen(false);
    }
    if (enquireOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [enquireOpen]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

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
            <Link
              key={l.href}
              href={l.href}
              className={`relative px-4 py-2 rounded-full text-sm transition-colors group ${
                isActive(l.href) ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span className="relative z-10">{l.label}</span>
              <span
                aria-hidden="true"
                className={`absolute inset-0 rounded-full transition-all duration-300 scale-90 group-hover:scale-100 ${
                  isActive(l.href) ? 'bg-white/[0.06]' : 'bg-white/0 group-hover:bg-white/[0.06]'
                }`}
              />
            </Link>
          ))}

          {/* Enquire Now dropdown */}
          <div ref={enquireRef} className="relative ml-3">
            <button
              type="button"
              onClick={() => setEnquireOpen((v) => !v)}
              aria-expanded={enquireOpen}
              aria-haspopup="menu"
              className="btn-neon text-sm py-2.5 inline-flex items-center gap-1.5"
            >
              Enquire Now
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${enquireOpen ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {enquireOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 rounded-2xl glass-strong border border-white/10 backdrop-blur-2xl shadow-card overflow-hidden animate-[fadeIn_180ms_ease-out]"
              >
                {enquireOptions.map((o) => (
                  <Link
                    key={o.href}
                    href={o.href}
                    role="menuitem"
                    className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.06] transition-colors group"
                    onClick={() => setEnquireOpen(false)}
                  >
                    <div>
                      <p className="text-sm font-medium text-ink uppercase tracking-wide">
                        {o.label}
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5">{o.sub}</p>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-ink-dim group-hover:text-neon-magenta transition-colors group-hover:translate-x-0.5"
                    >
                      <path
                        d="M5 12h14M13 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-bg/90 backdrop-blur-2xl animate-[fadeIn_200ms_ease-out]">
          <div className="px-5 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-3 rounded-xl text-ink-muted hover:text-ink hover:bg-white/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="px-4 text-[10px] uppercase tracking-[0.18em] text-ink-dim">Enquire Now</p>
              {enquireOptions.map((o) => (
                <Link
                  key={o.href}
                  href={o.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-sm text-ink uppercase tracking-wide">{o.label}</p>
                    <p className="text-[11px] text-ink-muted">{o.sub}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-dim">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
