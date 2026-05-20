'use client';

import { useEffect, useState } from 'react';

type Customer = {
  id: number;
  email: string;
  full_name: string;
  mobile: string;
  status: string;
  units_count: number;
  last_login_at: string | null;
  created_at: string;
};

type Project = { id: number; name: string };
type Unit = {
  id: number; project_id: number; project_name: string; tower_unit: string; configuration: string;
  carpet_area_sqft: number; total_value: number; construction_stage: string; expected_possession: string | null;
};
type Doc = { id: number; doc_type: string; title: string; doc_url: string; uploaded_at: string };
type Notif = { id: number; title: string; body: string; type: string; created_at: string };

const STAGES = ['announced', 'foundation', 'structure', 'finishing', 'ready', 'handover'];
const DOC_TYPES = ['agreement', 'receipt', 'allocation_letter', 'noc', 'other'];

export function CustomersManagement({ authHeader }: { authHeader: () => HeadersInit }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ customer: Customer; units: Unit[]; documents: Doc[]; notifications: Notif[] } | null>(null);

  // New customer form
  const [newCust, setNewCust] = useState({ email: '', full_name: '', mobile: '' });

  async function load() {
    try {
      const [cs, ps] = await Promise.all([
        fetch('/api/admin/customers', { headers: authHeader() }).then((r) => r.json()),
        fetch('/api/admin/projects', { headers: authHeader() }).then((r) => r.json()),
      ]);
      if (cs.ok) setCustomers(cs.customers);
      if (ps.ok) setProjects(ps.projects.map((p: any) => ({ id: p.id, name: p.name })));
    } catch (err: any) {
      setError(err?.message || 'Load failed.');
    }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function loadDetail(id: number) {
    setSelected(id);
    setDetail(null);
    const r = await fetch(`/api/admin/customers/${id}`, { headers: authHeader() });
    const d = await r.json();
    if (d.ok) setDetail({ customer: d.customer, units: d.units, documents: d.documents, notifications: d.notifications });
  }

  async function createCustomer() {
    if (!newCust.email || !newCust.full_name) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(newCust),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Could not create customer.');
      } else {
        setNewCust({ email: '', full_name: '', mobile: '' });
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file: File, type: 'cp-documents' | 'project-images' | 'project-brochures' | 'misc' = 'misc'): Promise<string> {
    const r = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ type, filename: file.name, contentType: file.type }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.message || 'Could not get upload URL.');
    const put = await fetch(d.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!put.ok) throw new Error('Upload failed');
    return d.publicUrl;
  }

  return (
    <section className="mt-6 space-y-8">
      {error && <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>}

      <div className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-xl">Create customer account</h3>
        <p className="text-xs text-ink-muted mt-1">
          They'll get a welcome email and can sign in via OTP at /my-home/login.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={newCust.full_name} onChange={(e) => setNewCust({ ...newCust, full_name: e.target.value })} placeholder="Full name" className="input" />
          <input type="email" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} placeholder="email@example.com" className="input" />
          <input value={newCust.mobile} onChange={(e) => setNewCust({ ...newCust, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="Mobile" className="input" />
        </div>
        <button onClick={createCustomer} disabled={busy || !newCust.email || !newCust.full_name} className="btn-neon text-sm mt-4">
          Create customer
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-display text-xl">All customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left">
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Mobile</Th>
                <Th>Units</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No customers yet.</td></tr>
              )}
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <Td>{c.full_name}</Td>
                  <Td>{c.email}</Td>
                  <Td>{c.mobile || '—'}</Td>
                  <Td>{c.units_count}</Td>
                  <Td>{c.status === 'active' ? <span className="chip text-emerald-300 border-emerald-300/30">Active</span> : <span className="chip text-orange-300 border-orange-300/30">Suspended</span>}</Td>
                  <Td><button onClick={() => loadDetail(c.id)} className="text-xs text-ink-muted hover:text-ink underline">Manage</button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected !== null && detail && (
        <CustomerDetailPanel
          authHeader={authHeader}
          customer={detail.customer}
          units={detail.units}
          documents={detail.documents}
          notifications={detail.notifications}
          projects={projects}
          uploadFile={uploadFile}
          onClose={() => { setSelected(null); setDetail(null); }}
          onChange={() => loadDetail(selected!)}
        />
      )}
    </section>
  );
}

function CustomerDetailPanel(props: {
  authHeader: () => HeadersInit;
  customer: Customer;
  units: Unit[];
  documents: Doc[];
  notifications: Notif[];
  projects: Project[];
  uploadFile: (file: File, type?: any) => Promise<string>;
  onClose: () => void;
  onChange: () => void;
}) {
  const { authHeader, customer, units, documents, notifications, projects, uploadFile, onClose, onChange } = props;
  const [newUnit, setNewUnit] = useState({
    project_id: projects[0]?.id ?? 0,
    tower_unit: '',
    configuration: '',
    carpet_area_sqft: 0,
    total_value: 0,
    construction_stage: 'announced',
    expected_possession: '',
  });
  const [newDoc, setNewDoc] = useState({ doc_type: 'agreement', title: '', file: null as File | null });
  const [newNotif, setNewNotif] = useState({ title: '', body: '', type: 'info' });
  const [busy, setBusy] = useState(false);

  async function addUnit() {
    setBusy(true);
    try {
      await fetch('/api/admin/customer-units', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ customer_id: customer.id, ...newUnit }),
      });
      setNewUnit({ ...newUnit, tower_unit: '', configuration: '' });
      onChange();
    } finally { setBusy(false); }
  }

  async function updateUnitStage(id: number, stage: string) {
    await fetch(`/api/admin/customer-units/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ construction_stage: stage }),
    });
    onChange();
    // Also send a notification
    await fetch('/api/admin/customer-notifications', {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({
        customer_id: customer.id,
        unit_id: id,
        title: `Construction update: ${stage}`,
        body: `Your unit has reached the ${stage} stage.`,
        type: 'milestone',
      }),
    });
    onChange();
  }

  async function addDoc() {
    if (!newDoc.title || !newDoc.file) return;
    setBusy(true);
    try {
      const url = await uploadFile(newDoc.file, 'cp-documents');
      await fetch('/api/admin/customer-documents', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          customer_id: customer.id,
          doc_type: newDoc.doc_type,
          title: newDoc.title,
          doc_url: url,
        }),
      });
      setNewDoc({ doc_type: 'agreement', title: '', file: null });
      onChange();
    } finally { setBusy(false); }
  }

  async function sendNotif() {
    if (!newNotif.title) return;
    setBusy(true);
    try {
      await fetch('/api/admin/customer-notifications', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ customer_id: customer.id, ...newNotif }),
      });
      setNewNotif({ title: '', body: '', type: 'info' });
      onChange();
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl glass-strong rounded-3xl shadow-card max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur-2xl bg-bg/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl">{customer.full_name}</h3>
            <p className="text-xs text-ink-muted">{customer.email} · {customer.mobile}</p>
          </div>
          <button onClick={onClose} className="btn-ghost text-sm">Close</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Units */}
          <section>
            <h4 className="font-display text-lg">Units</h4>
            <div className="mt-3 space-y-2">
              {units.length === 0 && <p className="text-ink-muted text-sm">No units assigned yet.</p>}
              {units.map((u) => (
                <div key={u.id} className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm min-w-0">
                    <p className="font-medium">{u.project_name} · {u.tower_unit || '—'}</p>
                    <p className="text-xs text-ink-muted">{u.configuration} · {u.carpet_area_sqft} sqft · ₹{(u.total_value / 100000).toFixed(2)} L</p>
                  </div>
                  <select
                    value={u.construction_stage}
                    onChange={(e) => updateUnitStage(u.id, e.target.value)}
                    className="input text-xs py-1.5 w-auto"
                  >
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <details className="mt-4">
              <summary className="text-sm cursor-pointer text-ink-muted hover:text-ink">+ Add unit</summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={newUnit.project_id} onChange={(e) => setNewUnit({ ...newUnit, project_id: Number(e.target.value) })} className="input">
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input value={newUnit.tower_unit} onChange={(e) => setNewUnit({ ...newUnit, tower_unit: e.target.value })} placeholder="A-1502" className="input" />
                <input value={newUnit.configuration} onChange={(e) => setNewUnit({ ...newUnit, configuration: e.target.value })} placeholder="3 BHK" className="input" />
                <input type="number" value={newUnit.carpet_area_sqft || ''} onChange={(e) => setNewUnit({ ...newUnit, carpet_area_sqft: Number(e.target.value) })} placeholder="Carpet sqft" className="input" />
                <input type="number" value={newUnit.total_value || ''} onChange={(e) => setNewUnit({ ...newUnit, total_value: Number(e.target.value) })} placeholder="Total value (INR)" className="input" />
                <input value={newUnit.expected_possession} onChange={(e) => setNewUnit({ ...newUnit, expected_possession: e.target.value })} placeholder="Possession e.g. Dec 2027" className="input" />
              </div>
              <button onClick={addUnit} disabled={busy} className="btn-neon text-sm mt-3">Add unit</button>
            </details>
          </section>

          {/* Documents */}
          <section className="pt-6 border-t border-white/10">
            <h4 className="font-display text-lg">Documents</h4>
            <ul className="mt-3 space-y-2">
              {documents.length === 0 && <li className="text-ink-muted text-sm">No documents shared.</li>}
              {documents.map((d) => (
                <li key={d.id} className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-medium">{d.title}</p>
                    <p className="text-[11px] text-ink-dim uppercase tracking-wider">{d.doc_type} · {new Date(d.uploaded_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <a href={d.doc_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5">Open</a>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={newDoc.doc_type} onChange={(e) => setNewDoc({ ...newDoc, doc_type: e.target.value })} className="input">
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} placeholder="Document title" className="input" />
              <input type="file" onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })} className="input file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-white/10 file:text-white" />
            </div>
            <button onClick={addDoc} disabled={busy || !newDoc.title || !newDoc.file} className="btn-neon text-sm mt-3">Upload document</button>
          </section>

          {/* Send notification */}
          <section className="pt-6 border-t border-white/10">
            <h4 className="font-display text-lg">Send notification</h4>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={newNotif.title} onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })} placeholder="Title" className="input" />
              <select value={newNotif.type} onChange={(e) => setNewNotif({ ...newNotif, type: e.target.value })} className="input">
                <option value="info">Info</option>
                <option value="milestone">Milestone</option>
                <option value="payment">Payment</option>
                <option value="document">Document</option>
              </select>
              <textarea value={newNotif.body} onChange={(e) => setNewNotif({ ...newNotif, body: e.target.value })} placeholder="Body" rows={3} className="input sm:col-span-2" />
            </div>
            <button onClick={sendNotif} disabled={busy || !newNotif.title} className="btn-neon text-sm mt-3">Send notification</button>
          </section>

          {/* Recent notifications */}
          <section className="pt-6 border-t border-white/10">
            <h4 className="font-display text-lg">Notifications sent</h4>
            <ul className="mt-3 space-y-2">
              {notifications.length === 0 && <li className="text-ink-muted text-sm">No notifications.</li>}
              {notifications.slice(0, 10).map((n) => (
                <li key={n.id} className="rounded-xl bg-white/[0.02] px-4 py-2 text-sm">
                  <span className="text-[10px] text-ink-dim uppercase tracking-wider mr-2">{n.type}</span>
                  {n.title}
                  <span className="block text-[11px] text-ink-dim">{new Date(n.created_at).toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
