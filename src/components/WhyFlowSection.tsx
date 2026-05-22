'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

const services = [
  {
    number: '01',
    title: 'Sales Acceleration',
    body: 'End-to-end sales execution from launch to last mile. Walk-ins, conversions, closures.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format&fit=crop',
    href: '/services#sales',
  },
  {
    number: '02',
    title: 'Strategy & Pricing',
    body: 'Market positioning, inventory management, and pricing that moves units without leaving money on the table.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    href: '/services#strategy',
  },
  {
    number: '03',
    title: 'Creative & Digital',
    body: 'Performance marketing, content, and creative that generates qualified leads at scale.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
    href: '/services#digital',
  },
  {
    number: '04',
    title: 'Channel Partner Synergy',
    body: '1000+ CP network activated per project. Onboarding, training, incentive design.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80&auto=format&fit=crop',
    href: '/services#cp',
  },
  {
    number: '05',
    title: 'CRM & Tech',
    body: 'Lead management, walk-in tracking, conversion analytics. Real-time dashboards for developers.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    href: '/services#crm',
  },
];

export function WhyFlowSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="services" className="py-12 lg:py-12 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between gap-6 flex-wrap mb-14"
        >
          <div>
            <span className="chip">Why Flow?</span>
            <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              We sell what others can&rsquo;t.
            </h2>
            <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
              From cashflow stress to sold-out projects. India&rsquo;s leading sales and marketing
              outsourcing partner for residential real estate.
            </p>
          </div>
          <Link href="/services" className="btn-ghost text-sm group">
            All capabilities
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>

        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Service list */}
          <div className="lg:col-span-7 space-y-1">
            {services.map((s, i) => (
              <motion.button
                key={s.number}
                onMouseEnter={() => setActiveIdx(i)}
                onFocus={() => setActiveIdx(i)}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`group block w-full text-left py-6 lg:py-7 border-b border-white/10 transition-all duration-500 ${
                  activeIdx === i ? 'pl-4 sm:pl-6' : 'pl-0'
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <span
                    className={`font-display text-2xl sm:text-3xl tabular-nums transition-colors duration-500 ${
                      activeIdx === i ? 'neon-text' : 'text-ink-dim'
                    }`}
                  >
                    {s.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight transition-colors duration-500 ${
                        activeIdx === i ? 'text-ink' : 'text-ink-muted group-hover:text-ink'
                      }`}
                    >
                      {s.title}
                    </h3>
                    <motion.p
                      animate={{
                        height: activeIdx === i ? 'auto' : 0,
                        opacity: activeIdx === i ? 1 : 0,
                        marginTop: activeIdx === i ? 12 : 0,
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="overflow-hidden text-sm text-ink-muted leading-relaxed max-w-md"
                    >
                      {s.body}
                    </motion.p>
                  </div>
                  <span
                    className={`hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
                      activeIdx === i
                        ? 'bg-neon-gradient text-white shadow-glow translate-x-0'
                        : 'bg-white/5 text-ink-muted -translate-x-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Preview image — matches the FULL height of the service list on desktop */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative h-full rounded-3xl overflow-hidden glass-strong shadow-card">
              {services.map((s, i) => (
                <motion.div
                  key={s.number}
                  initial={false}
                  animate={{
                    opacity: activeIdx === i ? 1 : 0,
                    scale: activeIdx === i ? 1 : 1.06,
                  }}
                  transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                </motion.div>
              ))}
              {/* Caption */}
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-0 left-0 right-0 p-6"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                  {services[activeIdx].number} / 0{services.length}
                </p>
                <h4 className="mt-1 font-heading uppercase text-2xl text-ink">
                  {services[activeIdx].title}
                </h4>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
