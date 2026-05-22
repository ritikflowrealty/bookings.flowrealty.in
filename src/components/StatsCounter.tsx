'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = { value: number; suffix: string; label: string };

function useCountUp(target: number, duration = 2000, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return count;
}

function StatItem({ stat, inView }: { stat: Stat; inView: boolean }) {
  const count = useCountUp(stat.value, 2000, inView);
  return (
    <div className="text-center px-3 py-4 sm:px-4 sm:py-5">
      <p className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl neon-text leading-none tabular-nums">
        {count.toLocaleString('en-IN')}
        <span className="font-bold">{stat.suffix}</span>
      </p>
      <p className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-ink-muted font-medium">
        {stat.label}
      </p>
    </div>
  );
}

export function StatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full glass-strong border-y border-white/10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-white/10">
        {stats.map((s, i) => (
          <StatItem key={i} stat={s} inView={inView} />
        ))}
      </div>
    </div>
  );
}
