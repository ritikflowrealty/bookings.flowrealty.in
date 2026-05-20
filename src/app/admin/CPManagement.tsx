'use client';

import { useEffect, useState } from 'react';

type CP = {
  id: number;
  email: string;
  full_name: string;
  mobile: string;
  whatsapp: string;
  rera_number: string;
  rera_doc_url: string;
  aadhaar_number: string;
  aadhaar_doc_url: string;
  pan_number: string;
  pan_doc_url: string;
  photo_url: string;
  company_name: string;
  city: string;
  status: string;
  rejection_reason: string;
  approved_at: string | null;
  created_at: string;
};

export function CPManagement({ authHeader }: { authHeader: () => HeadersInit }) {
  const [partners, setPartners] = useState<CP[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'suspended' | 'all'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    try {
      const url = filter === 'all' ? '/api/admin/cp' : `/api/admin/cp?status=${filter}`;
      const r = await fetch(url, { headers: authHeader() });
      const d = await r.json();
      if (d.ok) setPartners(d.partners);
    } catch (err: any) {
      setError(err?.message || 'Failed to load CPs.');
    }
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  async function action(id: number, kind: 'approve' | 'reject' | 'suspend' | 'activate') {
    let reason = '';
    if (kind === 'reject' || kind === 'suspend') {
      reason = prompt(`Enter ${kind} reason (optional):`) || '';
    }
    setBusy(id);
    setError(null);
    try {
      const r = await fetch(`/api/admin/cp/${id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ action: kind, reason }),
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

  const counts = partners.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 flex-wrap">
        {(['pending', 'approved', 'rejected', 'suspended', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-neon-gradient text-white' : 'glass text-ink-muted hover:text-ink'
            }`}
          >
            {f}
            {f !== 'all' && counts[f] != null ? ` (${counts[f]})` : ''}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="mt-6 grid gap-4">
        {partners.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-ink-muted">No partners in this view.</div>
        )}
        {partners.map((cp) => (
          <article key={cp.id} className="glass rounded-2xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3 flex items-start gap-3">
                {cp.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cp.photo_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                )}
                <div>
                  <h4 className="font-display text-lg leading-tight">{cp.full_name}</h4>
                  <p className="text-xs text-ink-dim">{cp.email}</p>
                  <p className="text-xs text-ink-dim">{cp.mobile}{cp.whatsapp && cp.whatsapp !== cp.mobile ? ` · WA ${cp.whatsapp}` : ''}</p>
                </div>
              </div>
              <div className="md:col-span-4 text-xs text-ink-muted space-y-1">
                <p><strong className="text-ink-muted">Company:</strong> {cp.company_name || '—'}</p>
                <p><strong className="text-ink-muted">City:</strong> {cp.city || '—'}</p>
                <p><strong className="text-ink-muted">RERA:</strong> {cp.rera_number || '—'}</p>
                <p><strong className="text-ink-muted">PAN:</strong> {cp.pan_number || '—'}</p>
                <p><strong className="text-ink-muted">Aadhaar:</strong> ****{cp.aadhaar_number?.slice(-4) || ''}</p>
              </div>
              <div className="md:col-span-3 text-xs space-y-1.5">
                {cp.rera_doc_url && <DocLink url={cp.rera_doc_url} label="RERA doc" />}
                {cp.aadhaar_doc_url && <DocLink url={cp.aadhaar_doc_url} label="Aadhaar" />}
                {cp.pan_doc_url && <DocLink url={cp.pan_doc_url} label="PAN" />}
              </div>
              <div className="md:col-span-2 flex flex-col gap-2 items-end">
                <StatusPill status={cp.status} />
                <div className="flex flex-col gap-1.5 w-full">
                  {cp.status === 'pending' && (
                    <>
                      <button onClick={() => action(cp.id, 'approve')} disabled={busy === cp.id} className="btn-neon text-xs py-1.5">Approve</button>
                      <button onClick={() => action(cp.id, 'reject')} disabled={busy === cp.id} className="btn-ghost text-xs py-1.5">Reject</button>
                    </>
                  )}
                  {cp.status === 'approved' && (
                    <button onClick={() => action(cp.id, 'suspend')} disabled={busy === cp.id} className="btn-ghost text-xs py-1.5">Suspend</button>
                  )}
                  {cp.status === 'suspended' && (
                    <button onClick={() => action(cp.id, 'activate')} disabled={busy === cp.id} className="btn-neon text-xs py-1.5">Reactivate</button>
                  )}
                  {cp.status === 'rejected' && cp.rejection_reason && (
                    <p className="text-xs text-ink-dim">Reason: {cp.rejection_reason}</p>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DocLink({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block text-ink-muted hover:text-ink underline-offset-4 hover:underline">
      📎 {label}
    </a>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
    approved: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
    rejected: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
    suspended: 'text-orange-300 border-orange-300/30 bg-orange-300/10',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${map[status] || 'text-ink-muted border-white/10'}`}>
      {status}
    </span>
  );
}
