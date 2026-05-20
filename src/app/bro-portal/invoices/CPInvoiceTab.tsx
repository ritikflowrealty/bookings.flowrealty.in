'use client';

import { useState } from 'react';

type Lead = {
  id: number; reference_number: string;
  prospect_first_name: string; prospect_last_name: string; status: string; project_name: string;
};
type Invoice = {
  id: number; invoice_number: string; amount: number; status: string;
  invoice_doc_url: string; notes: string; created_at: string;
  reviewed_at: string | null; paid_at: string | null;
  lead_ref: string | null; project_name: string | null;
};

export function CPInvoiceTab({ leads, invoices: initialInvoices }: { leads: Lead[]; invoices: Invoice[] }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [form, setForm] = useState({ lead_id: '', invoice_number: '', amount: '', notes: '', file: null as File | null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File): Promise<string> {
    const r = await fetch('/api/cp/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: 'rera_doc', filename: file.name, contentType: file.type }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.message || 'Could not get upload URL.');
    const put = await fetch(d.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!put.ok) throw new Error('Upload failed');
    return d.publicUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.lead_id) return setError('Pick a lead.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid amount.');
    if (!form.file) return setError('Upload the invoice file.');
    setBusy(true);
    try {
      const docUrl = await uploadFile(form.file);
      const r = await fetch('/api/cp/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: Number(form.lead_id),
          invoice_number: form.invoice_number,
          amount: Number(form.amount),
          notes: form.notes,
          invoice_doc_url: docUrl,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Could not submit invoice.');
      } else {
        setForm({ lead_id: '', invoice_number: '', amount: '', notes: '', file: null });
        // Reload page to refetch invoices
        window.location.reload();
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="glass rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-xl">Submit new invoice</h3>
        {leads.length === 0 ? (
          <p className="text-sm text-ink-muted">You need a qualified or booked lead before submitting an invoice.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="label block mb-1.5">Lead</span>
                <select className="input" value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })}>
                  <option value="">Pick a lead</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.reference_number} · {l.prospect_first_name} {l.prospect_last_name} · {l.project_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label block mb-1.5">Invoice number (optional)</span>
                <input className="input" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
              </label>
              <label className="block">
                <span className="label block mb-1.5">Amount (INR)</span>
                <input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </label>
              <label className="block">
                <span className="label block mb-1.5">Invoice file (PDF/JPG/PNG)</span>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                  className="input file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-white/10 file:text-white"
                />
              </label>
            </div>
            <label className="block">
              <span className="label block mb-1.5">Notes (optional)</span>
              <textarea className="input min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </label>
            {error && <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>}
            <button type="submit" disabled={busy} className="btn-neon text-sm">
              {busy ? 'Uploading…' : 'Submit invoice'}
            </button>
          </>
        )}
      </form>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-display text-xl">Submitted invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left">
              <tr>
                <Th>Date</Th>
                <Th>Project</Th>
                <Th>Lead</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>File</Th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No invoices submitted yet.</td></tr>
              ) : invoices.map((i) => (
                <tr key={i.id} className="border-t border-white/5">
                  <Td>{new Date(i.created_at).toLocaleDateString('en-IN')}</Td>
                  <Td>{i.project_name || '—'}</Td>
                  <Td mono>{i.lead_ref || '—'}</Td>
                  <Td>₹{Number(i.amount).toLocaleString('en-IN')}</Td>
                  <Td><StatusPill status={i.status} /></Td>
                  <Td><a href={i.invoice_doc_url} target="_blank" rel="noreferrer" className="text-ink-muted hover:text-ink underline-offset-4 hover:underline">View</a></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
    submitted: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
    under_review: 'text-sky-300 border-sky-300/30 bg-sky-300/10',
    approved: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
    paid: 'text-violet-300 border-violet-300/30 bg-violet-300/10',
    rejected: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border ${map[status] || 'text-ink-muted border-white/10'}`}>{status}</span>;
}
