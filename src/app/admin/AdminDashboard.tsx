'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Logo } from '@/components/Logo';
import { ProjectEditor } from './ProjectEditor';

const TOKEN_KEY = 'fr_admin_token';

type AdminProject = {
  id: number;
  slug: string;
  name: string;
  developer: string;
  city: string;
  description: string;
  highlight_text: string;
  image_url: string;
  learn_more_url: string;
  brochure_url: string;
  trust_point_1: string;
  trust_point_2: string;
  trust_point_3: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_active: number;
  cashfree_app_id: string;
  cashfree_secret_key: string;
  cashfree_active: number;
  cashfree_mode: string;
  payment_provider: string;
  is_visible: number;
  booking_enabled: number;
  payment_enabled: number;
  display_order: number;
};

type Stats = {
  totalProjects: number;
  visibleProjects: number;
  bookingOpen: number;
  paymentActive: number;
  totalBookings: number;
  paidBookings: number;
  revenue: number;
};

type Booking = {
  id: number;
  reference_number: string;
  full_name: string;
  email: string;
  mobile: string;
  amount: number;
  status: string;
  created_at: string;
  project_name?: string;
  project_developer?: string;
  tower_unit: string;
};

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'projects' | 'bookings'>('projects');
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [editing, setEditing] = useState<AdminProject | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authHeader = useCallback((): HeadersInit => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : '';
    return { Authorization: `Bearer ${t || ''}`, 'Content-Type': 'application/json' };
  }, []);

  const loadProjects = useCallback(async () => {
    const r = await fetch('/api/admin/projects', { headers: authHeader() });
    const d = await r.json();
    if (d.ok) setProjects(d.projects);
  }, [authHeader]);

  const loadStats = useCallback(async () => {
    const r = await fetch('/api/admin/stats', { headers: authHeader() });
    const d = await r.json();
    if (d.ok) setStats(d.stats);
  }, [authHeader]);

  const loadBookings = useCallback(async () => {
    const r = await fetch('/api/admin/bookings', { headers: authHeader() });
    const d = await r.json();
    if (d.ok) setBookings(d.bookings);
  }, [authHeader]);

  useEffect(() => {
    loadProjects();
    loadStats();
    loadBookings();
  }, [loadProjects, loadStats, loadBookings]);

  async function toggle(id: number, field: 'is_visible' | 'booking_enabled' | 'payment_enabled', value: boolean) {
    setError(null);
    const r = await fetch(`/api/admin/projects/${id}/toggle`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ field, value }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) {
      setError(d.message || 'Toggle failed');
      return;
    }
    await Promise.all([loadProjects(), loadStats()]);
  }

  async function deleteProject(id: number) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const r = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) {
      setError(d.message || 'Delete failed');
      return;
    }
    await Promise.all([loadProjects(), loadStats()]);
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="absolute inset-0 grid-bg opacity-30 -z-10" />
      {/* header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-bg/70 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="chip">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="btn-ghost text-sm">View site</a>
            <button onClick={onLogout} className="btn-ghost text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-8">
        {/* stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Projects" value={stats?.totalProjects ?? '—'} />
          <StatCard label="Visible" value={stats?.visibleProjects ?? '—'} />
          <StatCard label="Booking open" value={stats?.bookingOpen ?? '—'} />
          <StatCard label="Payments active" value={stats?.paymentActive ?? '—'} />
          <StatCard label="Total bookings" value={stats?.totalBookings ?? '—'} />
          <StatCard label="Paid" value={stats?.paidBookings ?? '—'} />
          <StatCard
            label="Revenue (paid)"
            value={stats ? `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}` : '—'}
            wide
          />
        </section>

        {/* tabs */}
        <div className="mt-10 flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex p-1 rounded-full glass">
            <TabBtn active={tab === 'projects'} onClick={() => setTab('projects')}>Projects</TabBtn>
            <TabBtn active={tab === 'bookings'} onClick={() => setTab('bookings')}>Bookings</TabBtn>
          </div>
          {tab === 'projects' && (
            <button onClick={() => setEditing('new')} className="btn-neon text-sm">
              + Add project
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {tab === 'projects' && (
          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects?.map((p) => (
              <article key={p.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                      {p.developer} · {p.city}
                    </p>
                    <h3 className="mt-1 font-display text-xl">{p.name}</h3>
                    <p className="text-xs text-ink-dim mt-0.5">/{p.slug}</p>
                  </div>
                  {p.razorpay_active || p.cashfree_active ? (
                    <span className="chip text-emerald-300 border-emerald-300/20">
                      {p.payment_provider === 'cashfree' ? 'Cashfree' : 'Razorpay'}
                    </span>
                  ) : (
                    <span className="chip text-amber-300 border-amber-300/20">No keys</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Toggle
                    label="Visible"
                    value={!!p.is_visible}
                    onChange={(v) => toggle(p.id, 'is_visible', v)}
                  />
                  <Toggle
                    label="Booking"
                    value={!!p.booking_enabled}
                    onChange={(v) => toggle(p.id, 'booking_enabled', v)}
                    disabled={!(p.razorpay_active || p.cashfree_active)}
                  />
                  <Toggle
                    label="Payment"
                    value={!!p.payment_enabled}
                    onChange={(v) => toggle(p.id, 'payment_enabled', v)}
                    disabled={!(p.razorpay_active || p.cashfree_active)}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(p)} className="btn-ghost text-xs px-4 py-2">
                      Edit
                    </button>
                    <a
                      href={`/book/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost text-xs px-4 py-2"
                    >
                      Open
                    </a>
                  </div>
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="text-xs text-ink-dim hover:text-neon-pink"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {projects?.length === 0 && (
              <p className="text-ink-muted">No projects yet. Click “Add project” to create one.</p>
            )}
          </section>
        )}

        {tab === 'bookings' && (
          <section className="mt-6 glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.04] text-left">
                  <tr>
                    <Th>Reference</Th>
                    <Th>Project</Th>
                    <Th>Customer</Th>
                    <Th>Mobile</Th>
                    <Th>Unit</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {bookings?.length ? (
                    bookings.map((b) => (
                      <tr key={b.id} className="border-t border-white/5">
                        <Td mono>{b.reference_number}</Td>
                        <Td>{b.project_name || '—'}</Td>
                        <Td>
                          <div>{b.full_name}</div>
                          <div className="text-xs text-ink-dim">{b.email}</div>
                        </Td>
                        <Td>{b.mobile}</Td>
                        <Td>{b.tower_unit}</Td>
                        <Td>₹{Number(b.amount).toLocaleString('en-IN')}</Td>
                        <Td>
                          <StatusPill status={b.status} />
                        </Td>
                        <Td>{new Date(b.created_at).toLocaleString('en-IN')}</Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-ink-muted">
                        No bookings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {editing && (
        <ProjectEditor
          project={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await Promise.all([loadProjects(), loadStats()]);
          }}
          authHeader={authHeader}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  wide,
}: {
  label: string;
  value: string | number;
  wide?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="label">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition-colors ${
        active ? 'bg-neon-gradient text-white shadow-glow' : 'text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      title={disabled ? 'Configure Razorpay keys first' : ''}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition ${
        disabled
          ? 'opacity-40 cursor-not-allowed border-white/10'
          : value
            ? 'border-neon-magenta/40 bg-neon-magenta/10 text-ink'
            : 'border-white/10 bg-white/[0.03] text-ink-muted hover:text-ink'
      }`}
    >
      <span>{label}</span>
      <span
        className={`w-7 h-4 rounded-full relative transition ${
          value ? 'bg-neon-gradient' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition ${
            value ? 'translate-x-3' : ''
          }`}
        />
      </span>
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">{children}</th>;
}
function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={`px-4 py-3 ${mono ? 'font-mono text-xs' : ''}`}>{children}</td>;
}
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
    pending: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
    created: 'text-sky-300 border-sky-300/30 bg-sky-300/10',
    failed: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
    cancelled: 'text-ink-dim border-white/10 bg-white/5',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${
        map[status] || 'text-ink-muted border-white/10'
      }`}
    >
      {status}
    </span>
  );
}
