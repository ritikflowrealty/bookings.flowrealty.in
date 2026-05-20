'use client';

import { useState } from 'react';

const cities = ['Bangalore', 'Mysore', 'Bhubaneswar'];
const configurations = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Plot'];
const budgets = [
  'Under ₹40 Lakhs',
  '₹40 Lakhs - ₹60 Lakhs',
  '₹60 Lakhs - ₹1 Crore',
  '₹1 Crore - ₹2 Crore',
  '₹2 Crore - ₹3 Crore',
  '₹3 Crore+',
];

export function EnquireForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    city: 'Bangalore',
    configuration: '',
    budget_range: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.full_name.trim()) return setError('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return setError('Enter a valid 10-digit Indian mobile.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError('Enter a valid email address.');

    setSubmitting(true);
    try {
      const r = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source_page: window.location.pathname }),
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
      <div className="text-center py-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-neon-gradient flex items-center justify-center shadow-glow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl">Got it.</h3>
        <p className="mt-2 text-ink-muted">An advisor will call you back within 2 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
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
          <select
            className="input"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Configuration">
          <select
            className="input"
            value={form.configuration}
            onChange={(e) => set('configuration', e.target.value)}
          >
            <option value="">Any</option>
            {configurations.map((c) => (
              <option key={c} value={c}>{c}</option>
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
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Anything specific? (optional)">
        <textarea
          className="input min-h-[100px]"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          rows={3}
        />
      </Field>

      {error && (
        <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-neon">
        {submitting ? 'Sending…' : 'Request a callback'}
      </button>
    </form>
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
