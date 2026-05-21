'use client';

import Link from 'next/link';
import { useState } from 'react';

const cards = [
  {
    id: 'cp',
    title: 'Channel Partner',
    subtitle: 'Register as a CP and start submitting leads',
    href: '/bro-portal/register',
    hoverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'developer',
    title: 'Developer',
    subtitle: 'Partner with Flow for your next project launch',
    href: '/enquire',
    hoverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'buyer',
    title: 'Home Buyer',
    subtitle: 'Browse curated homes and book in 60 seconds',
    href: '/projects',
    hoverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
];

export function RegisterInterest() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip">Register Your Interest</span>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            How can we help you?
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              onMouseEnter={() => setHovered(card.id)}
              onMouseLeave={() => setHovered(null)}
              className="group relative glass-strong rounded-3xl overflow-hidden h-[320px] sm:h-[380px] flex flex-col justify-end p-6 transition-all duration-500 hover:shadow-glow hover:-translate-y-1"
            >
              {/* Background image on hover */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                  hovered === card.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.hoverImage}
                  alt=""
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-display text-2xl sm:text-3xl">{card.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{card.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-ink group-hover:text-white transition-colors">
                  Get started
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
