'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

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
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {items.map((c, i) => (
          <Card key={c.id} cs={c} index={i} />
        ))}
      </div>
    </div>
  );
}

function Card({ cs, index }: { cs: CS; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  }

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
      transition={{ duration: 0.6, delay: index * 0.08 }}
      style={{ perspective: '1200px' }}
    >
      <Link
        ref={ref}
        href={`/case-studies/${cs.slug}`}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="group block relative rounded-3xl overflow-hidden glass-strong h-full transition-shadow hover:shadow-glow"
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: 'transform 0.4s ease',
          transformStyle: 'preserve-3d',
        }}
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
          <h3 className="font-heading uppercase text-xl leading-tight tracking-tight">
            {cs.title}
          </h3>
          {cs.excerpt && (
            <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">
              {cs.excerpt}
            </p>
          )}
          {metrics.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              {metrics.map((m, i) => (
                <div key={i}>
                  <p className="font-display text-lg sm:text-xl neon-text leading-none">{m.v}</p>
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
