'use client';

import { useEffect, useState } from 'react';

type Lead = {
  id: number;
  reference_number: string;
  source: string;
  channel_partner_id: number | null;
  cp_name: string | null;
  cp_email: string | null;
  project_id: number | null;
  project_name: string | null;
  prospect_first_name: string;
  prospect_last_name: string;
  prospect_mobile: string;
  prospect_alt_mobile: string;
  prospect_email: string;
  configuration: string;
  budget_range: string;
  preferred_location: string;
  timeline: string;
  notes: string;
  status: string;
  assigned_to: string;
  walkin_date: string | null;
  lost_reason: string;
  created_at: string;
  updated_at: string;
};

const STATUSES = ['new', 'contacted', 'qualified', 'site_visit', 'booked', 'lost'] as const;
const SOURCES = ['cp', 'enquiry', 'walk_in'] as const;

export function LeadsManagement({ authHeader }: { authHeader: () => HeadersInit }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      const url = `/api/admin/leads${params.toString() ? '?' + params.toString() : ''}`;
      const r = await fetch(url, { headers: authHeader() });
      const d = await r.json();
      if (d.ok) setLeads(d.leads);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leads.');
    }
  }
  useEffect(() => { load(); }, [statusFilter, sourceFilter]); // eslint-disable-line

  async function update(id: number, patch: Partial<Pick<Lead, 'status' | 'assigned_to' | 'notes' | 'lost_reason' | 'walkin_date'>>) {
    setBusy(id);
    setError(null);
    try {
      const r = await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(patch),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Update failed.');
      } else {
        await load();
      }
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
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-ink-muted ml-3">Source:</span>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="">All</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-3 text-xs text-ink-dim">{leads.length} leads</span>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="mt-6 grid gap-3">
        {leads.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-ink-muted">No leads in this view.</div>
        )}
        {leads.map((l) => (
          <article key={l.id} className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-ink-dim">{l.reference_number}</span>
                  <SourcePill source={l.source} />
                  <StatusPill status={l.status} />
                </div>
                <h4 className="mt-1.5 font-display text-lg leading-tight">
                  {l.prospect_first_name} {l.prospect_last_name}
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  {l.prospect_mobile}
                  {l.prospect_email ? ` · ${l.prospect_email}` : ''}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {l.project_name || '—'} · {l.configuration || '—'} · {l.budget_range || '—'}
                </p>
                {l.cp_name && (
                  <p className="text-[11px] text-ink-dim mt-1">
                    Submitted by CP: <strong className="text-ink-muted">{l.cp_name}</strong> ({l.cp_email})
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <select
                  value={l.status}
                  onChange={(e) => update(l.id, { status: e.target.value })}
                  disabled={busy === l.id}
                  className="input text-xs py-1.5 w-auto"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  {expanded === l.id ? 'Hide details' : 'Details'}
                </button>
              </div>
            </div>

            {expanded === l.id && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Detail label="Preferred location" value={l.preferred_location} />
                <Detail label="Timeline" value={l.timeline} />
                <Detail label="Alt mobile" value={l.prospect_alt_mobile} />
                <Detail label="Created" value={new Date(l.created_at).toLocaleString('en-IN')} />
                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="label block mb-1.5">Assigned to</span>
                    <input
                      type="email"
                      defaultValue={l.assigned_to}
                      onBlur={(e) => {
                        if (e.target.value !== l.assigned_to) update(l.id, { assigned_to: e.target.value });
                      }}
                      placeholder="team-member@flowrealty.in"
                      className="input"
                    />
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="label block mb-1.5">Notes</span>
                    <textarea
                      defaultValue={l.notes}
                      onBlur={(e) => {
                        if (e.target.value !== l.notes) update(l.id, { notes: e.target.value });
                      }}
                      className="input min-h-[80px]"
                      rows={3}
                    />
                  </label>
                </div>
                {l.status === 'lost' && (
                  <div className="sm:col-span-2">
                    <label className="block">
                      <span className="label block mb-1.5">Lost reason</span>
                      <input
                        defaultValue={l.lost_reason}
                        onBlur={(e) => {
                          if (e.target.value !== l.lost_reason) update(l.id, { lost_reason: e.target.value });
                        }}
                        className="input"
                      />
                    </label>
                  </div>
                )}
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
      <p className="text-sm text-ink-muted mt-0.5">{value || '—'}</p>
    </div>
  );
}
function SourcePill({ source }: { source: string }) {
  const map: Record<string, string> = {
    cp: 'text-purple-300 border-purple-300/30 bg-purple-300/10',
    enquiry: 'text-sky-300 border-sky-300/30 bg-sky-300/10',
    walk_in: 'text-orange-300 border-orange-300/30 bg-orange-300/10',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${map[source] || 'text-ink-muted border-white/10'}`}>{source}</span>;
}
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
    contacted: 'text-sky-300 border-sky-300/30 bg-sky-300/10',
    qualified: 'text-cyan-300 border-cyan-300/30 bg-cyan-300/10',
    site_visit: 'text-violet-300 border-violet-300/30 bg-violet-300/10',
    booked: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
    lost: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${map[status] || 'text-ink-muted border-white/10'}`}>{status}</span>;
}
