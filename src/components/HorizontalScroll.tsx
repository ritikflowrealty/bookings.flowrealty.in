'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

const slides = [
  {
    id: 'about',
    title: 'About Us',
    subtitle: 'Founded by alumni of IIM-Bangalore & NMIMS with 16+ years in real estate',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    href: '/about',
    cta: 'Our Story',
  },
  {
    id: 'services',
    title: 'Our Services',
    subtitle: 'Strategy, Sales Acceleration, Digital Marketing, CRM & Channel Partner Synergy',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    href: '/services',
    cta: 'Explore Services',
  },
  {
    id: 'case-studies',
    title: 'Case Studies',
    subtitle: 'New launches, turnarounds, last mile closures, and plot developments',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    href: '/case-studies',
    cta: 'See Results',
  },
  {
    id: 'life',
    title: 'Life at Flow',
    subtitle: 'Team testimonials, behind the scenes, and what makes us different',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    href: '/life-at-flow',
    cta: 'Meet the Team',
  },
];

export function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-60%']);

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-6 pl-8 lg:pl-16">
          {slides.map((slide, i) => (
            <Link
              key={slide.id}
              href={slide.href}
              className="group relative flex-shrink-0 w-[80vw] sm:w-[60vw] lg:w-[40vw] h-[70vh] rounded-3xl overflow-hidden"
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay at bottom only */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-heading text-3xl sm:text-4xl text-white tracking-tight">
                  {slide.title}
                </h3>
                <p className="mt-2 text-sm text-white/70 max-w-sm leading-relaxed">
                  {slide.subtitle}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-white/90 group-hover:text-white transition-colors">
                  {slide.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
