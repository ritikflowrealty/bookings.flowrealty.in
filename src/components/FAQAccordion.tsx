'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FAQ = { id: number; question: string; answer: string };

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <div
            key={f.id}
            className="glass rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
            >
              <span className="font-heading uppercase text-base tracking-tight text-white">
                {f.question}
              </span>
              <span
                aria-hidden="true"
                className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center transition-transform ${
                  isOpen ? 'rotate-45' : ''
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-ink leading-relaxed">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
