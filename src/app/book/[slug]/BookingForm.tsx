'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicProject } from '@/lib/projects';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const MAX_RETRIES = 3;

type FieldErrors = Partial<Record<string, string>>;

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function BookingForm({
  project,
  paymentEnabled,
}: {
  project: PublicProject;
  paymentEnabled: boolean;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    tower_unit: '',
    amount: '' as string | number,
    address: '',
    city: '',
    pincode: '',
    terms_accepted: false,
  });

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validateClient(): FieldErrors {
    const e: FieldErrors = {};
    if (form.full_name.trim().length < 2) e.full_name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a 10-digit Indian mobile.';
    if (!form.tower_unit.trim()) e.tower_unit = 'Enter a preferred unit (e.g. A-102).';
    const amt = Number(form.amount);
    if (!Number.isFinite(amt) || amt < 1) e.amount = 'Enter a valid amount in INR.';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = 'Pincode must be 6 digits.';
    if (!form.terms_accepted) e.terms_accepted = 'Please accept the booking terms.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);

    if (!paymentEnabled) {
      setGlobalError('Payments are temporarily unavailable for this project.');
      return;
    }
    if (retryCount >= MAX_RETRIES) {
      setGlobalError('Too many attempts. Please contact our sales team for assistance.');
      return;
    }

    const v = validateClient();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    setSubmitting(true);
    try {
      // 1) create booking + razorpay order on the server
      const resp = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_slug: project.slug,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          tower_unit: form.tower_unit.trim(),
          amount: Number(form.amount),
          address: form.address.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
          terms_accepted: form.terms_accepted,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        if (data.field) setErrors((er) => ({ ...er, [data.field]: data.message }));
        setGlobalError(data.message || 'Could not create booking.');
        setRetryCount((c) => c + 1);
        setSubmitting(false);
        return;
      }

      // 2) load razorpay script
      const ok = await loadRazorpayScript();
      if (!ok) {
        setGlobalError('Could not load Razorpay. Check your internet connection.');
        setRetryCount((c) => c + 1);
        setSubmitting(false);
        return;
      }

      // 3) open checkout
      const rzp = new window.Razorpay({
        key: data.razorpay_key_id,
        order_id: data.order_id,
        amount: data.amount_paise,
        currency: 'INR',
        name: 'Flow Realty',
        description: `${project.name} · ${project.developer}`,
        prefill: {
          name: form.full_name,
          email: form.email,
          contact: form.mobile,
        },
        notes: {
          reference_number: data.reference_number,
          project: project.name,
          developer: project.developer,
          city: project.city,
          tower_unit: form.tower_unit,
          full_name: form.full_name,
          email: form.email,
          mobile: form.mobile,
          address: form.address,
          customer_city: form.city,
          pincode: form.pincode,
        },
        theme: { color: '#7B2EFF' },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setGlobalError('Payment window closed before completion.');
            setRetryCount((c) => c + 1);
          },
        },
        handler: async (resp: any) => {
          // verify on the server
          const v = await fetch('/api/bookings/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking_id: data.booking_id,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          const vd = await v.json();
          if (!v.ok || !vd.ok) {
            setGlobalError('Payment verification failed. Please contact support.');
            setSubmitting(false);
            return;
          }
          router.push(`/booking/success?ref=${encodeURIComponent(data.reference_number)}`);
        },
      });
      rzp.on('payment.failed', (resp: any) => {
        setGlobalError(resp?.error?.description || 'Payment failed.');
        setRetryCount((c) => c + 1);
        setSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      setGlobalError(err?.message || 'Something went wrong. Try again.');
      setRetryCount((c) => c + 1);
      setSubmitting(false);
    }
  }

  const payLabel = (() => {
    const n = Number(form.amount);
    if (!Number.isFinite(n) || n <= 0) return 'Pay';
    return `Pay ₹${n.toLocaleString('en-IN')}`;
  })();

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Full name"
          error={errors.full_name}
          input={
            <input
              className="input"
              autoComplete="name"
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
            />
          }
        />
        <Field
          label="Email"
          error={errors.email}
          input={
            <input
              type="email"
              className="input"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
            />
          }
        />
        <Field
          label="Mobile (10 digits)"
          error={errors.mobile}
          input={
            <input
              inputMode="numeric"
              maxLength={10}
              className="input"
              autoComplete="tel"
              value={form.mobile}
              onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, ''))}
            />
          }
        />
        <Field
          label="Preferred unit"
          error={errors.tower_unit}
          input={
            <input
              className="input"
              placeholder="e.g. A-102"
              value={form.tower_unit}
              onChange={(e) => setField('tower_unit', e.target.value)}
            />
          }
        />
        <Field
          label="Amount (INR)"
          error={errors.amount}
          input={
            <input
              inputMode="numeric"
              className="input"
              placeholder=""
              value={form.amount as string}
              onChange={(e) => setField('amount', e.target.value.replace(/[^\d]/g, ''))}
            />
          }
        />
        <Field
          label="Pincode (optional)"
          error={errors.pincode}
          input={
            <input
              inputMode="numeric"
              maxLength={6}
              className="input"
              value={form.pincode}
              onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, ''))}
            />
          }
        />
        <Field
          label="Address (optional)"
          input={
            <input
              className="input"
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
            />
          }
        />
        <Field
          label="City (optional)"
          input={
            <input
              className="input"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
            />
          }
        />
      </div>

      <label className="flex gap-3 items-start text-sm text-ink-muted cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.terms_accepted}
          onChange={(e) => setField('terms_accepted', e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#D92EFF]"
        />
        <span>
          This booking is provisional. A confirmation will be sent to you by the team after review.
        </span>
      </label>
      {errors.terms_accepted && <p className="text-xs text-neon-pink">{errors.terms_accepted}</p>}

      {globalError && (
        <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm text-ink">
          {globalError}
          {retryCount >= MAX_RETRIES && (
            <span className="block mt-1 text-ink-muted">
              Please contact our sales team at +91 80 1234 5678.
            </span>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || retryCount >= MAX_RETRIES}
        className="btn-neon w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Opening Razorpay…' : payLabel}
      </button>

      <p className="text-[11px] text-ink-dim">
        Secured by Razorpay. By continuing you agree that this booking is provisional and subject
        to confirmation by Flow Realty.
      </p>
    </form>
  );
}

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="label block mb-1.5">{label}</span>
      {input}
      {error && <span className="block mt-1 text-xs text-neon-pink">{error}</span>}
    </label>
  );
}
