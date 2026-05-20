import Link from 'next/link';
import { SectionReveal } from './SectionReveal';

export type RelatedLink = { href: string; label: string; description?: string };

export function RelatedLinks({
  title,
  items,
}: {
  title: string;
  items: RelatedLink[];
}) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
      <SectionReveal>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight">{title}</h2>
        <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="block glass rounded-xl px-4 py-3 text-sm text-ink-muted hover:text-ink hover:bg-white/[0.06] transition-colors"
              >
                <span className="block">{it.label}</span>
                {it.description && (
                  <span className="block text-[11px] text-ink-dim mt-0.5">{it.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </SectionReveal>
    </section>
  );
}
