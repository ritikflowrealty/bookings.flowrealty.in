'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Portal = 'cp' | 'developer' | 'customer';

export function OtpLoginForm({ portal, redirectTo }: { portal: Portal; redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch('/api/portal/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal, email }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.message || 'Could not send code.');
      } else {
        setInfo(d.message || 'If your email is registered, you\'ll receive a code shortly.');
        setStage('code');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch('/api/portal/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portal, email, code }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Invalid code.');
        setSubmitting(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Network error.');
      setSubmitting(false);
    }
  }

  if (stage === 'email') {
    return (
      <form onSubmit={requestCode} className="space-y-4">
        <label className="block">
          <span className="label block mb-1.5">Registered email</span>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        {error && <p className="text-xs text-neon-pink">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-neon w-full">
          {submitting ? 'Sending code…' : 'Send sign-in code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      {info && <p className="text-xs text-emerald-300">{info}</p>}
      <p className="text-sm text-ink-muted">Code sent to <strong className="text-ink">{email}</strong></p>
      <label className="block">
        <span className="label block mb-1.5">6-digit code</span>
        <input
          inputMode="numeric"
          maxLength={6}
          className="input tracking-[0.5em] text-center font-mono text-xl"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          autoFocus
          required
        />
      </label>
      {error && <p className="text-xs text-neon-pink">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { setStage('email'); setCode(''); setError(null); setInfo(null); }}
          className="btn-ghost text-sm"
        >
          Use different email
        </button>
        <button type="submit" disabled={submitting} className="btn-neon flex-1">
          {submitting ? 'Verifying…' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}
