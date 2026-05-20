'use client';

import { useEffect, useState } from 'react';

type Invoice = {
  id: number;
  channel_partner_id: number;
  cp_name: string;
  cp_email: string;
  lead_ref: string | null;
  project_name: string | null;
  invoice_number: string;
  amount: number;
  invoice_doc_url: string;
  status: string;
  notes: string;
  reviewed_at: string | null;
  paid_at: string | null;
  created_at: string;
};

const STATUSES = ['submitted', 'under_review', 'approved', 'paid', 'rejected'] as const;

export function InvoicesManagement({ authHeader }: { authHeader: () => HeadersInit }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<string>('submitted');
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const url = `/api/admin/invoices${filter === 'all' ? '' : `?status=${filter}`}`;
      const r = await fetch(url, { headers: authHeader() });
      const d = await r.json();
      if (d.ok) setInvoices(d.invoices);
    } catch (err: any) {
      setError(err?.message || 'Load failed.');
    }
  }
  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  async function update(id: number, status: string) {
    const notes = (status === 'rejected') ? (prompt('Rejection reason (optional):') || '') : '';
    setBusy(id);
    setError(null);
    try {
      const r = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ status, notes }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Failed.');
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
        {[...STATUSES, 'all' as const].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-neon-gradient text-white' : 'glass text-ink-muted hover:text-ink'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <div className="mt-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>}

      <div className="mt-6 grid gap-3">
        {invoices.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-ink-muted">No invoices in this view.</div>
        )}
        {invoices.map((i) => (
          <article key={i.id} className="glass rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-3">
                <p className="text-xs text-ink-dim">{new Date(i.created_at).toLocaleDateString('en-IN')}</p>
                <p className="font-display text-lg leading-tight">₹{Number(i.amount).toLocaleString('en-IN')}</p>
                {i.invoice_number && <p className="text-[11px] text-ink-dim">#{i.invoice_number}</p>}
              </div>
              <div className="md:col-span-4">
                <p className="text-sm">{i.cp_name}</p>
                <p className="text-xs text-ink-muted">{i.cp_email}</p>
                <p className="text-[11px] text-ink-dim">{i.project_name || '—'} · Lead {i.lead_ref || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <a href={i.invoice_doc_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5 inline-flex">
                  View file
                </a>
              </div>
              <div className="md:col-span-3 flex flex-col items-end gap-1.5">
                <StatusPill status={i.status} />
                <select
                  value={i.status}
                  onChange={(e) => update(i.id, e.target.value)}
                  disabled={busy === i.id}
                  className="input text-xs py-1.5 w-auto"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            {i.notes && <p className="mt-3 text-xs text-ink-muted">Notes: {i.notes}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
    under_review: 'text-sky-300 border-sky-300/30 bg-sky-300/10',
    approved: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
    paid: 'text-violet-300 border-violet-300/30 bg-violet-300/10',
    rejected: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${map[status] || 'text-ink-muted border-white/10'}`}>{status}</span>;
}
