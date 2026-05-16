import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/10 bg-bg-soft">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-ink-muted leading-relaxed max-w-sm">
            Premium homes across Bangalore and Mysuru. Provisional booking with secure Razorpay
            checkout and a sales team that confirms within 24 hours.
          </p>
        </div>
        <div>
          <p className="label">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><a href="#projects" className="hover:text-ink">Projects</a></li>
            <li><a href="#why" className="hover:text-ink">Why Choose Us</a></li>
            <li><a href="#contact" className="hover:text-ink">Contact</a></li>
            <li><a href="/privacy" className="hover:text-ink">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <p className="label">Reach Us</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><a href="tel:+918012345678" className="hover:text-ink">+91 80 1234 5678</a></li>
            <li><a href="mailto:hello@flowrealty.in" className="hover:text-ink">hello@flowrealty.in</a></li>
            <li>Richards Town, Bangalore</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ink-dim">
        © {new Date().getFullYear()} Flow Realty. All rights reserved.
      </div>
    </footer>
  );
}
