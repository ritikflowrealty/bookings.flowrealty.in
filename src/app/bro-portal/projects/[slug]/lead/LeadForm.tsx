'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const configs = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Plot'];
const budgets = ['Under ₹40 L', '₹40 L - ₹60 L', '₹60 L - ₹1 Cr', '₹1 Cr - ₹2 Cr', '₹2 Cr - ₹3 Cr', '₹3 Cr+'];
const timelines = ['Immediate', '1-3 months', '3-6 months', '6-12 months', 'Just exploring'];

export function LeadForm({ projectId, projectSlug }: { projectId: number; projectSlug: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [form, setForm] = useState({
    prospect_first_name: '',
    prospect_last_name: '',
    prospect_mobile: '',
    prospect_alt_mobile: '',
    prospect_email: '',
    configuration: '',
    budget_range: '',
    preferred_location: '',
    timeline: '',
    notes: '',
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function nextStep() {
    setError(null);
    if (step === 1) {
      if (form.prospect_first_name.trim().length < 2) return setError('Enter prospect first name.');
      if (!/^[6-9]\d{9}$/.test(form.prospect_mobile)) return setError('Enter a valid 10-digit mobile.');
      if (form.prospect_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.prospect_email))
        return setError('Email looks invalid.');
    }
    setStep(step + 1);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch('/api/cp/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, ...form }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Could not submit lead.');
        setSubmitting(false);
        return;
      }
      setReference(d.reference_number);
    } catch (err: any) {
      setError(err?.message || 'Network error.');
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-neon-gradient flex items-center justify-center shadow-glow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl">Lead registered</h3>
        <p className="mt-2 text-ink-muted">Reference</p>
        <p className="font-mono text-lg">{reference}</p>
        <div className="mt-8 flex gap-3 justify-center">
          <a href="/bro-portal/dashboard" className="btn-ghost text-sm">Dashboard</a>
          <a href={`/bro-portal/projects/${projectSlug}/lead`} className="btn-neon text-sm">Submit another</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Stepper step={step} totalSteps={3} />

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl">Lead's personal details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First name" required value={form.prospect_first_name} onChange={(v) => set('prospect_first_name', v)} />
            <Input label="Last name" value={form.prospect_last_name} onChange={(v) => set('prospect_last_name', v)} />
            <Input label="Mobile (10 digits)" required maxLength={10} value={form.prospect_mobile} onChange={(v) => set('prospect_mobile', v.replace(/\D/g, ''))} />
            <Input label="Alt mobile" maxLength={10} value={form.prospect_alt_mobile} onChange={(v) => set('prospect_alt_mobile', v.replace(/\D/g, ''))} />
            <Input label="Email (optional)" type="email" value={form.prospect_email} onChange={(v) => set('prospect_email', v)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl">Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Configuration" value={form.configuration} onChange={(v) => set('configuration', v)} options={configs} />
            <Select label="Budget range" value={form.budget_range} onChange={(v) => set('budget_range', v)} options={budgets} />
            <Input label="Preferred location" value={form.preferred_location} onChange={(v) => set('preferred_location', v)} />
            <Select label="Timeline" value={form.timeline} onChange={(v) => set('timeline', v)} options={timelines} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-display text-xl">Notes (optional)</h3>
          <label className="block">
            <span className="label block mb-1.5">Anything the sales team should know?</span>
            <textarea
              className="input min-h-[120px]"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={4}
            />
          </label>
        </div>
      )}

      {error && <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>}

      <div className="flex justify-between pt-4 border-t border-white/5">
        <button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="btn-ghost text-sm disabled:opacity-40">
          Back
        </button>
        {step < 3 ? (
          <button type="button" onClick={nextStep} className="btn-neon text-sm">Next</button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting} className="btn-neon text-sm">
            {submitting ? 'Submitting…' : 'Submit lead'}
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-2 flex-1">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
              n === step ? 'border-neon-magenta bg-neon-magenta/10 text-ink' :
              n < step ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-300' :
              'border-white/10 text-ink-dim'
            }`}
          >
            {n}
          </span>
          {n < totalSteps && (
            <span className={`flex-1 h-px ${n < step ? 'bg-emerald-300/40' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Input({
  label, required, type = 'text', value, onChange, maxLength,
}: {
  label: string; required?: boolean; type?: string; value: string;
  onChange: (v: string) => void; maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="label block mb-1.5">{label}{required && <span className="text-neon-pink ml-0.5">*</span>}</span>
      <input type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="label block mb-1.5">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
