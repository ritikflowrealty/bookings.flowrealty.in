'use client';

import { useEffect, useState } from 'react';

type Application = {
  id: number;
  reference_number: string;
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
  cv_url: string;
  cv_filename: string;
  source_page: string;
  status: string;
  notes: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
};

const STATUSES = ['new', 'shortlisted', 'interviewing', 'hired', 'rejected'] as const;
const ROLES = [
  { value: '', label: 'All' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'tech', label: 'Technology' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'customer-success', label: 'Customer Success' },
  { value: 'design', label: 'Design' },
  { value: 'other', label: 'Other' },
];

export function CareersManagement({
  authHeader,
}: {
  authHeader: () => HeadersInit;
}) {
  const [items, setItems] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (roleFilter) params.set('role', roleFilter);
      const url = `/api/admin/career-applications${
        params.toString() ? '?' + params.toString() : ''
      }`;
      const r = await fetch(url, { headers: authHeader() });
      const d = await r.json();
      if (d.ok) setItems(d.applications);
      else setError(d.message || 'Failed to load applications.');
    } catch (err: any) {
      setError(err?.message || 'Failed to load applications.');
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter, roleFilter]); // eslint-disable-line

  async function update(
    id: number,
    patch: Partial<Pick<Application, 'status' | 'notes' | 'assigned_to'>>
  ) {
    setBusy(id);
    setError(null);
    try {
      const r = await fetch(`/api/admin/career-applications/${id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(patch),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) setError(d.message || 'Update failed.');
      else await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-ink-muted">Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-muted ml-3">Role:</span>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input text-xs py-1.5 w-auto"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <span className="ml-3 text-xs text-ink-dim">{items.length} applications</span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {items.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-ink-muted">
            No career applications in this view.
          </div>
        )}
        {items.map((a) => (
          <article key={a.id} className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-ink-dim">
                    {a.reference_number}
                  </span>
                  <RolePill role={a.role_interest} />
                  <StatusPill status={a.status} />
                </div>
                <h4 className="mt-1.5 font-display text-lg leading-tight">{a.full_name}</h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  {a.mobile} · {a.email}
                  {a.city ? ` · ${a.city}` : ''}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {a.current_role || '—'}
                  {a.current_company ? ` @ ${a.current_company}` : ''}
                  {a.experience_years ? ` · ${a.experience_years} yrs` : ''}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                {a.cv_url && (
                  <a
                    href={a.cv_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-neon text-xs px-3 py-1.5"
                  >
                    View CV
                  </a>
                )}
                <select
                  value={a.status}
                  onChange={(e) => update(a.id, { status: e.target.value })}
                  disabled={busy === a.id}
                  className="input text-xs py-1.5 w-auto"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  {expanded === a.id ? 'Hide details' : 'Details'}
                </button>
              </div>
            </div>

            {expanded === a.id && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Detail label="Submitted" value={new Date(a.created_at).toLocaleString('en-IN')} />
                <Detail label="CV file" value={a.cv_filename} />
                <Detail
                  label="LinkedIn"
                  value={a.linkedin_url ? <ExternalLink url={a.linkedin_url} /> : null}
                />
                <Detail
                  label="Portfolio"
                  value={a.portfolio_url ? <ExternalLink url={a.portfolio_url} /> : null}
                />
                <Detail label="Source page" value={a.source_page} />
                {a.message && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-wider text-ink-dim">
                      Why Flow
                    </p>
                    <p className="text-sm text-ink-muted mt-0.5 whitespace-pre-wrap">
                      {a.message}
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="label block mb-1.5">Assigned recruiter (email)</span>
                    <input
                      type="email"
                      defaultValue={a.assigned_to}
                      onBlur={(e) => {
                        if (e.target.value !== a.assigned_to)
                          update(a.id, { assigned_to: e.target.value });
                      }}
                      placeholder="recruiter@flowrealty.in"
                      className="input"
                    />
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="label block mb-1.5">Internal notes</span>
                    <textarea
                      defaultValue={a.notes}
                      onBlur={(e) => {
                        if (e.target.value !== a.notes) update(a.id, { notes: e.target.value });
                      }}
                      className="input min-h-[80px]"
                      rows={3}
                      placeholder="Interview feedback, follow-up notes…"
                    />
                  </label>
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-2 mt-1">
                  <a href={`tel:+91${a.mobile}`} className="btn-ghost text-xs px-3 py-1.5">
                    Call
                  </a>
                  <a
                    href={`https://wa.me/91${a.mobile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    WhatsApp
                  </a>
                  <a href={`mailto:${a.email}`} className="btn-ghost text-xs px-3 py-1.5">
                    Email
                  </a>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-dim">{label}</p>
      <p className="text-sm text-ink-muted mt-0.5 break-words">{value || '—'}</p>
    </div>
  );
}

function ExternalLink({ url }: { url: string }) {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* ignore */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-neon-magenta hover:underline"
    >
      {host}
    </a>
  );
}

function RolePill({ role }: { role: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border text-violet-300 border-violet-300/30 bg-violet-300/10">
      {role || 'other'}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
    shortlisted: 'text-sky-300 border-sky-300/30 bg-sky-300/10',
    interviewing: 'text-cyan-300 border-cyan-300/30 bg-cyan-300/10',
    hired: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
    rejected: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${map[status] || 'text-ink-muted border-white/10'}`}
    >
      {status}
    </span>
  );
}
