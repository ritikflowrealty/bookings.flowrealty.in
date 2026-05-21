'use client';

import { motion } from 'framer-motion';
import { SectionReveal } from './SectionReveal';

const partners = [
  'Sterling Developers',
  'Habitat Ventures',
  'Navami Builders',
  'Sipani Properties',
  'Svamitva Ventures',
  'UKN Properties',
  'Sumadhura Group',
  'Arsis Green Hills',
  'Mana Projects',
  'Sowparnika Projects',
];

export function PartnersSection() {
  return (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionReveal>
          <span className="chip">Our Partners</span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl tracking-tight">
            Trusted by India&rsquo;s leading developers.
          </h2>
        </SectionReveal>
      </div>

      {/* Infinite scroll marquee */}
      <div className="mt-12 relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg to-transparent z-10" />
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...partners, ...partners].map((p, i) => (
            <div
              key={`${p}-${i}`}
              className="flex-shrink-0 glass rounded-2xl px-8 py-5 flex items-center justify-center"
            >
              <span className="text-sm font-medium text-ink-muted whitespace-nowrap">{p}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
