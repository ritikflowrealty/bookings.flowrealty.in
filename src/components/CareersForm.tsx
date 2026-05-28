'use client';

import { useState } from 'react';

const ROLE_OPTIONS = [
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'tech', label: 'Technology' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'customer-success', label: 'Customer Success' },
  { value: 'design', label: 'Design' },
  { value: 'other', label: 'Other' },
];

const EXP_OPTIONS = [
  { value: '0-1', label: '0 – 1 year' },
  { value: '1-3', label: '1 – 3 years' },
  { value: '3-5', label: '3 – 5 years' },
  { value: '5-10', label: '5 – 10 years' },
  { value: '10+', label: '10+ years' },
];

const CITIES = ['Bangalore', 'Mysore', 'Bhubaneswar', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Other'];

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_CV_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

type FormState = {
  full_name: string;
  email: string;
  mobile: string;
  city: string;
  role_interest: string;
  experience_years: string;
  current_company: string;
  current_role: string;
  linkedin_url: string;
  portfolio_url: string;
  message: string;
};

const INITIAL: FormState = {
  full_name: '',
  email: '',
  mobile: '',
  city: '',
  role_interest: '',
  experience_years: '',
  current_company: '',
  current_role: '',
  linkedin_url: '',
  portfolio_url: '',
  message: '',
};

export function CareersForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function pickCv(file: File | null) {
    setError(null);
    if (!file) {
      setCvFile(null);
      return;
    }
    if (!ALLOWED_CV_MIME.includes(file.type)) {
      setError('Please upload your CV as PDF, DOC or DOCX.');
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setError('CV file is too large (max 5 MB).');
      return;
    }
    setCvFile(file);
  }

  async function uploadCv(file: File): Promise<{ url: string; filename: string }> {
    const r = await fetch('/api/careers/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.message || 'Could not get an upload URL.');

    const put = await fetch(d.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!put.ok) throw new Error('CV upload failed. Please try again.');

    return { url: d.publicUrl, filename: file.name };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.full_name.trim()) return setError('Please enter your full name.');
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      return setError('Enter a valid 10-digit Indian mobile number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError('Enter a valid email address.');
    if (!form.role_interest) return setError('Pick the area you want to join in.');
    if (!cvFile) return setError('Please attach your CV (PDF, DOC or DOCX).');
    if (form.linkedin_url && !/^https?:\/\//i.test(form.linkedin_url))
      return setError('LinkedIn URL must start with https://');
    if (form.portfolio_url && !/^https?:\/\//i.test(form.portfolio_url))
      return setError('Portfolio URL must start with https://');

    setSubmitting(true);
    try {
      const cv = await uploadCv(cvFile);

      const r = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cv_url: cv.url,
          cv_filename: cv.filename,
          source_page: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Could not submit your application. Please try again.');
        return;
      }
      setDone({ reference: d.reference_number });
    } catch (err: any) {
      setError(err?.message || 'Network error. Please retry.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-14 h-14 rounded-full bg-neon-gradient flex items-center justify-center shadow-glow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-heading uppercase text-2xl">Application received.</h3>
        <p className="mt-2 text-ink">
          Thanks for applying to Flow. Our team reviews every CV personally.
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Reference: <span className="font-mono">{done.reference}</span>
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          If we see a fit, we&rsquo;ll reach out to you on <strong>{form.email}</strong> or{' '}
          <strong>+91 {form.mobile}</strong> within a week.
        </p>
      </div>
    );
  }

  return (
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
        <Field label="Email" required>
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
            <option value="">Select</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Area of interest" required>
          <select
            className="input"
            value={form.role_interest}
            onChange={(e) => set('role_interest', e.target.value)}
          >
            <option value="">Select</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Years of experience">
          <select
            className="input"
            value={form.experience_years}
            onChange={(e) => set('experience_years', e.target.value)}
          >
            <option value="">Select</option>
            {EXP_OPTIONS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Current company">
          <input
            className="input"
            value={form.current_company}
            onChange={(e) => set('current_company', e.target.value)}
          />
        </Field>
        <Field label="Current role">
          <input
            className="input"
            value={form.current_role}
            onChange={(e) => set('current_role', e.target.value)}
          />
        </Field>
        <Field label="LinkedIn URL">
          <input
            type="url"
            className="input"
            placeholder="https://linkedin.com/in/your-handle"
            value={form.linkedin_url}
            onChange={(e) => set('linkedin_url', e.target.value)}
          />
        </Field>
        <Field label="Portfolio / Website">
          <input
            type="url"
            className="input"
            placeholder="https://"
            value={form.portfolio_url}
            onChange={(e) => set('portfolio_url', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Why Flow?">
        <textarea
          className="input min-h-[110px]"
          rows={4}
          maxLength={2000}
          placeholder="Tell us briefly what you're looking for and what you'd bring."
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
        />
      </Field>

      <Field label="Upload CV (PDF, DOC, DOCX — max 5 MB)" required>
        <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] transition-colors">
          <span className="text-sm text-ink-muted truncate">
            {cvFile ? cvFile.name : 'Choose a file…'}
          </span>
          <span className="btn-ghost text-xs px-3 py-1.5 shrink-0">Browse</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(e) => pickCv(e.target.files?.[0] || null)}
          />
        </label>
        {cvFile && (
          <p className="mt-1 text-xs text-ink-dim">
            {(cvFile.size / 1024).toFixed(0)} KB · {cvFile.type || 'unknown type'}
          </p>
        )}
      </Field>

      {error && (
        <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-neon" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit application'}
        </button>
        <p className="text-xs text-ink-dim">
          By submitting, you agree to our privacy policy.
        </p>
      </div>
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
        {required && <span className="text-neon-pink ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
