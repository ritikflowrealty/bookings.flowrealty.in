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
              Curated homes from India&rsquo;s leading developers. Reserve in seconds, with our
              sales team on the line every step of the way.
            </p>
            <div className="mt-5 space-y-2 text-sm text-ink-muted">
              <p><a href="tel:+918012345678" className="hover:text-ink">+91 80 1234 5678</a></p>
              <p><a href="mailto:hello@flowrealty.in" className="hover:text-ink">hello@flowrealty.in</a></p>
              <p>Richards Town, Bangalore</p>
            </div>
          </div>

          <div>
            <p className="label">Bangalore by location</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {bangaloreLocations.map((l) => (
                <li key={l.slug}>
                  <Link href={`/bangalore/flats-in-${l.slug}/`} className="hover:text-ink">
                    Flats in {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label">Bangalore by budget</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {bangaloreBudgets.map((b) => (
                <li key={b.slug}>
                  <Link href={`/bangalore/${b.slug}/`} className="hover:text-ink">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label">By configuration</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {configurations.map((c) => (
                <li key={c.slug}>
                  <Link href={`/bangalore/${c.slug}/`} className="hover:text-ink">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="label mb-2">Company</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/about" className="hover:text-ink">About</Link></li>
              <li><Link href="/team" className="hover:text-ink">Team Flow</Link></li>
              <li><Link href="/awards" className="hover:text-ink">Awards</Link></li>
              <li><Link href="/news" className="hover:text-ink">News</Link></li>
              <li><Link href="/careers" className="hover:text-ink">Careers</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Verticals</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/projects" className="hover:text-ink">All Projects</Link></li>
              <li><Link href="/case-studies" className="hover:text-ink">Case Studies</Link></li>
              <li><Link href="/developers" className="hover:text-ink">Our Developers</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Partners</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/bro-portal" className="hover:text-ink">Channel Partners</Link></li>
              <li><Link href="/developer-portal" className="hover:text-ink">Developers</Link></li>
              <li><Link href="/my-home" className="hover:text-ink">Customer Portal</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Legal</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li><Link href="/privacy" className="hover:text-ink">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink">Terms</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
              <li><Link href="/enquire" className="hover:text-ink">Enquire Now</Link></li>
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
