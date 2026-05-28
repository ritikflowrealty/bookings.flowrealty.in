'use client';

import { useEffect, useState } from 'react';

type Enquiry = {
  id: number;
  audience: 'buyer' | 'developer' | 'cp';
  full_name: string;
  email: string;
  mobile: string;
  city: string;
  configuration: string;
  budget_range: string;
  message: string;
  source_page: string;
  company_name: string;
  designation: string;
  project_name: string;
  unit_count: string;
  rera_number: string;
  status: string;
  created_at: string;
};

const AUDIENCES = [
  { value: '', label: 'All' },
  { value: 'buyer', label: 'Customer' },
  { value: 'developer', label: 'Developer' },
  { value: 'cp', label: 'Channel Partner' },
];
const STATUSES = ['new', 'contacted', 'closed'] as const;

export function EnquiriesManagement({
  authHeader,
}: {
  authHeader: () => HeadersInit;
}) {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [audience, setAudience] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const params = new URLSearchParams();
      if (audience) params.set('audience', audience);
      if (statusFilter) params.set('status', statusFilter);
      const url = `/api/admin/enquiries${params.toString() ? '?' + params.toString() : ''}`;
      const r = await fetch(url, { headers: authHeader() });
      const d = await r.json();
      if (d.ok) setItems(d.enquiries);
      else setError(d.message || 'Failed to load enquiries.');
    } catch (err: any) {
      setError(err?.message || 'Failed to load enquiries.');
    }
  }

  useEffect(() => {
    load();
  }, [audience, statusFilter]); // eslint-disable-line

  async function setStatus(id: number, status: string) {
    setBusy(id);
    setError(null);
    try {
      const r = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) setError(d.message || 'Update failed.');
      else await load();
    } finally {
      setBusy(null);
    }
  }

  const counts = items.reduce(
    (acc, e) => {
      acc.total++;
      acc[e.audience] = (acc[e.audience] || 0) + 1;
      return acc;
    },
    { total: 0 } as Record<string, number>
  );

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-ink-muted">Audience:</span>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="input text-xs py-1.5 w-auto"
        >
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-muted ml-3">Status:</span>
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
        <span className="ml-3 text-xs text-ink-dim">
          {counts.total} total · {counts.buyer || 0} customer · {counts.developer || 0}{' '}
          developer · {counts.cp || 0} CP
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {items.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-ink-muted">
            No enquiries in this view yet.
          </div>
        )}
        {items.map((e) => (
          <article key={e.id} className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <AudiencePill audience={e.audience} />
                  <StatusPill status={e.status} />
                  <span className="text-[11px] text-ink-dim">
                    {new Date(e.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                <h4 className="mt-1.5 font-display text-lg leading-tight">{e.full_name}</h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  {e.mobile}
                  {e.email ? ` · ${e.email}` : ''}
                  {e.city ? ` · ${e.city}` : ''}
                </p>
                {e.audience === 'buyer' && (e.configuration || e.budget_range) && (
                  <p className="text-xs text-ink-muted mt-0.5">
                    {e.configuration || '—'} · {e.budget_range || '—'}
                  </p>
                )}
                {e.audience === 'developer' && (
                  <p className="text-xs text-ink-muted mt-0.5">
                    {e.company_name || '—'}
                    {e.project_name ? ` · ${e.project_name}` : ''}
                    {e.unit_count ? ` · ${e.unit_count} units` : ''}
                  </p>
                )}
                {e.audience === 'cp' && (
                  <p className="text-xs text-ink-muted mt-0.5">
                    {e.company_name || '—'}
                    {e.designation ? ` · ${e.designation}` : ''}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <select
                  value={e.status}
                  onChange={(ev) => setStatus(e.id, ev.target.value)}
                  disabled={busy === e.id}
                  className="input text-xs py-1.5 w-auto"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  {expanded === e.id ? 'Hide details' : 'Details'}
                </button>
              </div>
            </div>

            {expanded === e.id && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {e.audience === 'buyer' && (
                  <>
                    <Detail label="Configuration" value={e.configuration} />
                    <Detail label="Budget" value={e.budget_range} />
                  </>
                )}
                {e.audience === 'developer' && (
                  <>
                    <Detail label="Company" value={e.company_name} />
                    <Detail label="Designation" value={e.designation} />
                    <Detail label="Project" value={e.project_name} />
                    <Detail label="Units" value={e.unit_count} />
                    <Detail label="RERA" value={e.rera_number} />
                  </>
                )}
                {e.audience === 'cp' && (
                  <>
                    <Detail label="Company" value={e.company_name} />
                    <Detail label="Designation" value={e.designation} />
                    <Detail label="RERA" value={e.rera_number} />
                  </>
                )}
                <Detail label="Source page" value={e.source_page} />
                {e.message && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-wider text-ink-dim">
                      Message
                    </p>
                    <p className="text-sm text-ink-muted mt-0.5 whitespace-pre-wrap">
                      {e.message}
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2 flex flex-wrap gap-2 mt-2">
                  <a
                    href={`tel:+91${e.mobile}`}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    Call
                  </a>
                  <a
                    href={`https://wa.me/91${e.mobile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    WhatsApp
                  </a>
                  {e.email && (
                    <a
                      href={`mailto:${e.email}`}
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      Email
                    </a>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-dim">{label}</p>
      <p className="text-sm text-ink-muted mt-0.5 break-words">{value || '—'}</p>
    </div>
  );
}

function AudiencePill({ audience }: { audience: 'buyer' | 'developer' | 'cp' }) {
  const map: Record<string, { label: string; cls: string }> = {
    buyer: {
      label: 'Customer',
      cls: 'text-sky-300 border-sky-300/30 bg-sky-300/10',
    },
    developer: {
      label: 'Developer',
      cls: 'text-violet-300 border-violet-300/30 bg-violet-300/10',
    },
    cp: {
      label: 'Channel Partner',
      cls: 'text-purple-300 border-purple-300/30 bg-purple-300/10',
    },
  };
  const m = map[audience];
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
    contacted: 'text-cyan-300 border-cyan-300/30 bg-cyan-300/10',
    closed: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${map[status] || 'text-ink-muted border-white/10'}`}
    >
      {status}
    </span>
  );
}
