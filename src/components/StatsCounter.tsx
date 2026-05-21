'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = { value: number; suffix: string; label: string };

function useCountUp(target: number, duration = 2000, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
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
  const count = useCountUp(stat.value, 2200, inView);
  return (
    <div className="text-center px-4 py-6 sm:py-8">
      <p className="font-display text-4xl sm:text-5xl lg:text-6xl neon-text">
        {count.toLocaleString('en-IN')}{stat.suffix}
      </p>
      <p className="mt-2 text-xs sm:text-sm uppercase tracking-[0.15em] text-ink-muted">{stat.label}</p>
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
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full glass-strong border-y border-white/10 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-white/10">
        {stats.map((s, i) => (
          <StatItem key={i} stat={s} inView={inView} />
        ))}
      </div>
    </div>
  );
}
