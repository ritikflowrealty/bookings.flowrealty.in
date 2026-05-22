'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Audience = 'developer' | 'cp' | 'buyer';

const TABS: { id: Audience; label: string; sub: string }[] = [
  { id: 'developer', label: 'Developer', sub: 'Outsource sales for your project' },
  { id: 'cp', label: 'Channel Partner', sub: 'Register as a CP and submit leads' },
  { id: 'buyer', label: 'Home Buyer', sub: 'Browse curated homes and book online' },
];

const cities = ['Bangalore', 'Mysore', 'Bhubaneswar', 'Other'];
const configurations = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Plot'];
const budgets = [
  'Under ₹40 Lakhs',
  '₹40L - ₹60L',
  '₹60L - ₹1 Cr',
  '₹1 Cr - ₹2 Cr',
  '₹2 Cr - ₹3 Cr',
  '₹3 Cr+',
];

export function EnquireBlock({ initial = 'buyer' }: { initial?: Audience }) {
  const [audience, setAudience] = useState<Audience>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    city: '',
    configuration: '',
    budget_range: '',
    message: '',
    company_name: '',
    designation: '',
    project_name: '',
    unit_count: '',
    rera_number: '',
  });

  useEffect(() => setAudience(initial), [initial]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.full_name.trim()) return setError('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      return setError('Enter a valid 10-digit Indian mobile.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError('Enter a valid email address.');

    setSubmitting(true);
    try {
      const r = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          audience,
          source_page: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Something went wrong. Try again.');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Network error.');
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-14 h-14 rounded-full bg-neon-gradient flex items-center justify-center shadow-glow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-heading uppercase text-2xl">Got it.</h3>
        <p className="mt-2 text-ink">An advisor will call you back within 2 hours.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Audience tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAudience(t.id)}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium uppercase tracking-wider transition-all ${
              audience === t.id
                ? 'bg-neon-gradient text-white shadow-glow'
                : 'bg-white/[0.05] border border-white/10 text-ink hover:bg-white/[0.1]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink-muted mb-6">
        {TABS.find((t) => t.id === audience)?.sub}
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" required>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Mobile" required>
            <input
              inputMode="numeric"
              maxLength={10}
              className="input"
              value={form.mobile}
              onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))}
              autoComplete="tel"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field label="City">
            <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
              <option value="">Select</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <AnimatePresence mode="wait">
          {audience === 'developer' && (
            <motion.div
              key="dev"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Field label="Company name" required>
                <input
                  className="input"
                  value={form.company_name}
                  onChange={(e) => set('company_name', e.target.value)}
                />
              </Field>
              <Field label="Your designation">
                <input
                  className="input"
                  value={form.designation}
                  onChange={(e) => set('designation', e.target.value)}
                />
              </Field>
              <Field label="Project name">
                <input
                  className="input"
                  value={form.project_name}
                  onChange={(e) => set('project_name', e.target.value)}
                />
              </Field>
              <Field label="Total units">
                <input
                  className="input"
                  value={form.unit_count}
                  onChange={(e) => set('unit_count', e.target.value)}
                />
              </Field>
              <Field label="RERA number">
                <input
                  className="input"
                  value={form.rera_number}
                  onChange={(e) => set('rera_number', e.target.value)}
                />
              </Field>
              <Field label="What do you need from Flow?">
                <input
                  className="input"
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="Sales mandate, marketing, CRM, plotted..."
                />
              </Field>
            </motion.div>
          )}

          {audience === 'cp' && (
            <motion.div
              key="cp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Field label="Company / agency name">
                <input
                  className="input"
                  value={form.company_name}
                  onChange={(e) => set('company_name', e.target.value)}
                />
              </Field>
              <Field label="RERA number">
                <input
                  className="input"
                  value={form.rera_number}
                  onChange={(e) => set('rera_number', e.target.value)}
                />
              </Field>
              <Field label="Anything we should know? (optional)">
                <textarea
                  className="input min-h-[80px]"
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                />
              </Field>
            </motion.div>
          )}

          {audience === 'buyer' && (
            <motion.div
              key="buyer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Field label="Configuration">
                <select
                  className="input"
                  value={form.configuration}
                  onChange={(e) => set('configuration', e.target.value)}
                >
                  <option value="">Any</option>
                  {configurations.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Budget">
                <select
                  className="input"
                  value={form.budget_range}
                  onChange={(e) => set('budget_range', e.target.value)}
                >
                  <option value="">Any</option>
                  {budgets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Anything specific? (optional)">
                <textarea
                  className="input min-h-[80px]"
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-neon">
          {submitting ? 'Sending…' : 'Request a callback'}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label block mb-1.5">
        {label}
        {required && <span className="text-neon-pink ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
