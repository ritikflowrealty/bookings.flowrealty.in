import Link from 'next/link';
import { SectionReveal } from './SectionReveal';

export function InlineEnquireCard({
  title = 'Not sure where to start?',
  body = 'Tell us your budget and city. Our advisor calls back within 2 hours with curated options.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
      <SectionReveal>
        <div className="glass-strong rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-card">
          <div className="max-w-xl">
            <h3 className="font-display text-2xl sm:text-3xl tracking-tight">{title}</h3>
            <p className="mt-2 text-ink-muted">{body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/enquire" className="btn-neon">Enquire Now</Link>
            <a href="tel:+918012345678" className="btn-ghost">Call us</a>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
