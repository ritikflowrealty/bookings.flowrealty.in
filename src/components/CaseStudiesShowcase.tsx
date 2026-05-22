'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';

type CS = {
  id: number;
  slug: string;
  title: string;
  client_name: string;
  cover_image_url: string;
  excerpt: string;
  metric_1_label: string;
  metric_1_value: string;
  metric_2_label: string;
  metric_2_value: string;
  metric_3_label: string;
  metric_3_value: string;
};

export function CaseStudiesShowcase({ items }: { items: CS[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none]"
      >
        <div className="flex gap-5 lg:gap-6 px-5 lg:pl-[max(2rem,calc((100vw-1280px)/2+2rem))] lg:pr-[max(2rem,calc((100vw-1280px)/2+2rem))]">
          {items.map((c, i) => (
            <Card key={c.id} cs={c} index={i} />
          ))}
        </div>
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function Card({ cs, index }: { cs: CS; index: number }) {
  const metrics = [
    { l: cs.metric_1_label, v: cs.metric_1_value },
    { l: cs.metric_2_label, v: cs.metric_2_value },
    { l: cs.metric_3_label, v: cs.metric_3_value },
  ].filter((m) => m.v);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="snap-start flex-shrink-0 w-[80%] sm:w-[60%] md:w-[420px] lg:w-[440px]"
    >
      <Link
        href={`/case-studies/${cs.slug}`}
        className="group block relative rounded-3xl overflow-hidden glass-strong h-full transition-shadow hover:shadow-glow"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.03]">
          {cs.cover_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cs.cover_image_url}
              alt={cs.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neon-purple/30 via-neon-magenta/20 to-neon-orange/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
          {cs.client_name && (
            <span className="absolute top-4 left-4 chip backdrop-blur-md bg-black/40">
              {cs.client_name}
            </span>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <h3 className="font-heading uppercase text-lg sm:text-xl leading-tight tracking-tight">
            {cs.title}
          </h3>
          {cs.excerpt && (
            <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">
              {cs.excerpt}
            </p>
          )}
          {metrics.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              {metrics.map((m, i) => (
                <div key={i}>
                  <p className="font-display text-base sm:text-lg neon-text leading-none font-bold">
                    {m.v}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-ink-dim mt-1.5 leading-tight">
                    {m.l}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
