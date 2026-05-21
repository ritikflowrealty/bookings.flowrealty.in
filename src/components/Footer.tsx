import Link from 'next/link';
import { Logo } from './Logo';

const bangaloreLocations = [
  { slug: 'sarjapur-road', label: 'Sarjapur Road' },
  { slug: 'whitefield', label: 'Whitefield' },
  { slug: 'electronic-city', label: 'Electronic City' },
  { slug: 'hebbal', label: 'Hebbal' },
  { slug: 'jp-nagar', label: 'JP Nagar' },
  { slug: 'kanakapura-road', label: 'Kanakapura Road' },
  { slug: 'yelahanka', label: 'Yelahanka' },
  { slug: 'devanahalli', label: 'Devanahalli' },
];

const bangaloreBudgets = [
  { slug: 'properties-under-40-lakhs-in-bangalore', label: 'Under ₹40 Lakhs' },
  { slug: 'properties-under-60-lakhs-in-bangalore', label: 'Under ₹60 Lakhs' },
  { slug: 'properties-under-1-crore-in-bangalore', label: 'Under ₹1 Crore' },
  { slug: 'properties-under-2-crore-in-bangalore', label: 'Under ₹2 Crore' },
  { slug: 'properties-under-3-crore-in-bangalore', label: 'Under ₹3 Crore' },
  { slug: 'luxury-properties-in-bangalore', label: 'Luxury (₹3 Cr+)' },
];

const configurations = [
  { slug: '1-bhk-flats-in-bangalore', label: '1 BHK Flats' },
  { slug: '2-bhk-flats-in-bangalore', label: '2 BHK Flats' },
  { slug: '3-bhk-flats-in-bangalore', label: '3 BHK Flats' },
  { slug: '4-bhk-flats-in-bangalore', label: '4 BHK Flats' },
  { slug: 'villas-in-bangalore', label: 'Villas' },
  { slug: 'plots-in-bangalore', label: 'Plots' },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-bg-soft">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <Logo height={36} />
            <p className="mt-4 text-sm text-ink-muted leading-relaxed max-w-sm">
              India&rsquo;s #1 sales and marketing outsourcing partner for residential real estate.
              From cashflow stress to sold-out projects.
            </p>
            <div className="mt-5 space-y-2 text-sm text-ink-muted">
              <p><a href="tel:+918012345678" className="hover:text-ink transition-colors">+91 80 1234 5678</a></p>
              <p><a href="mailto:hello@flowrealty.in" className="hover:text-ink transition-colors">hello@flowrealty.in</a></p>
              <p>Richards Town, Bangalore</p>
            </div>
            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              <a href="https://www.linkedin.com/company/flowrealtyindia" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-ink-muted">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Location links — these link to /bangalore/flats-in-[slug]/ which is a real route */}
          <div>
            <p className="label">Bangalore by location</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {bangaloreLocations.map((l) => (
                <li key={l.slug}>
                  <Link href={`/bangalore/flats-in-${l.slug}/`} className="hover:text-ink transition-colors">
                    Flats in {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Budget links — these link to /bangalore/[budget-slug]/ which is handled by [city]/[slug] */}
          <div>
            <p className="label">Bangalore by budget</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {bangaloreBudgets.map((b) => (
                <li key={b.slug}>
                  <Link href={`/bangalore/${b.slug}/`} className="hover:text-ink transition-colors">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Configuration links */}
          <div>
            <p className="label">By configuration</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {configurations.map((c) => (
                <li key={c.slug}>
                  <Link href={`/bangalore/${c.slug}/`} className="hover:text-ink transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Second row of links */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="label mb-2">Company</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/about" className="hover:text-ink transition-colors">About Us</Link></li>
              <li><Link href="/life-at-flow" className="hover:text-ink transition-colors">Life at Flow</Link></li>
              <li><Link href="/case-studies" className="hover:text-ink transition-colors">Case Studies</Link></li>
              <li><Link href="/blogs" className="hover:text-ink transition-colors">Blogs</Link></li>
              <li><Link href="/careers" className="hover:text-ink transition-colors">Careers</Link></li>
              <li><Link href="/news" className="hover:text-ink transition-colors">News</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Services</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/services" className="hover:text-ink transition-colors">All Services</Link></li>
              <li><Link href="/services#strategy" className="hover:text-ink transition-colors">Strategy</Link></li>
              <li><Link href="/services#sales" className="hover:text-ink transition-colors">Sales Acceleration</Link></li>
              <li><Link href="/services#digital" className="hover:text-ink transition-colors">Digital Marketing</Link></li>
              <li><Link href="/services#crm" className="hover:text-ink transition-colors">CRM</Link></li>
              <li><Link href="/projects" className="hover:text-ink transition-colors">Projects</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Partners</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/bro-portal" className="hover:text-ink transition-colors">Channel Partners</Link></li>
              <li><Link href="/developer-portal" className="hover:text-ink transition-colors">Developers</Link></li>
              <li><Link href="/my-home" className="hover:text-ink transition-colors">Customer Portal</Link></li>
              <li><Link href="/enquire" className="hover:text-ink transition-colors">Enquire Now</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Legal</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink transition-colors">Terms</Link></li>
              <li><Link href="/contact" className="hover:text-ink transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ink-dim">
        © {new Date().getFullYear()} Flow Realty. All rights reserved.
      </div>
    </footer>
  );
}
