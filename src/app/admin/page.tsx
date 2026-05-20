'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { AdminDashboard } from './AdminDashboard';

const TOKEN_KEY = 'fr_admin_token';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      setAuthed(false);
      return;
    }
    fetch('/api/admin-auth/check', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) localStorage.removeItem(TOKEN_KEY);
        setAuthed(!!d.ok);
      })
      .catch(() => setAuthed(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch('/api/admin-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Login failed');
        setLoading(false);
        return;
      }
      localStorage.setItem(TOKEN_KEY, d.token);
      setAuthed(true);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      fetch('/api/admin-auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setPassword('');
  }

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-muted">Loading…</div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="absolute inset-0 grid-bg opacity-50 -z-10" />
        <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-card">
          <Logo />
          <h1 className="mt-6 font-display text-3xl tracking-tight">Admin access</h1>
          <p className="mt-1 text-sm text-ink-muted">Enter the admin password to continue.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="label block mb-1.5">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
            {error && <p className="text-sm text-neon-pink">{error}</p>}
            <button type="submit" disabled={loading} className="btn-neon w-full">
              {loading ? 'Verifying…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-[11px] text-ink-dim">
            Password is verified server-side and never exposed to the browser.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

