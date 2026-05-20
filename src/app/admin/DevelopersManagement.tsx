'use client';

import { useEffect, useState } from 'react';

type Developer = { id: number; slug: string; name: string; total_projects: number; is_published: number };
type DevUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  developer_id: number;
  developer_name: string;
  last_login_at: string | null;
  created_at: string;
};

export function DevelopersManagement({ authHeader }: { authHeader: () => HeadersInit }) {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [users, setUsers] = useState<DevUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // New developer
  const [newDevName, setNewDevName] = useState('');

  // Invite user
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'manager' | 'admin'>('viewer');
  const [inviteDevId, setInviteDevId] = useState<number | null>(null);

  async function load() {
    try {
      const [d1, d2] = await Promise.all([
        fetch('/api/admin/developers', { headers: authHeader() }).then((r) => r.json()),
        fetch('/api/admin/developer-users', { headers: authHeader() }).then((r) => r.json()),
      ]);
      if (d1.ok) {
        setDevelopers(d1.developers);
        if (d1.developers[0] && !inviteDevId) setInviteDevId(d1.developers[0].id);
      }
      if (d2.ok) setUsers(d2.users);
    } catch (err: any) {
      setError(err?.message || 'Load failed.');
    }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function createDeveloper() {
    if (!newDevName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/developers', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ name: newDevName.trim() }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Could not create developer.');
      } else {
        setNewDevName('');
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function invite() {
    if (!inviteEmail || !inviteName || !inviteDevId) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/developer-users', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          full_name: inviteName.trim(),
          role: inviteRole,
          developer_id: inviteDevId,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setError(d.message || 'Invite failed.');
      } else {
        setInviteEmail('');
        setInviteName('');
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function suspendUser(id: number, suspend: boolean) {
    setBusy(true);
    try {
      await fetch(`/api/admin/developer-users/${id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ action: suspend ? 'suspend' : 'activate' }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(id: number) {
    if (!confirm('Remove this user? They will lose access immediately.')) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/developer-users/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      {error && (
        <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-xl">Developers</h3>
        <p className="text-xs text-ink-muted mt-1">
          Create developer companies. Project ↔ developer linkage is by name (set on each project).
        </p>
        <div className="mt-4 flex gap-2 flex-wrap">
          <input
            value={newDevName}
            onChange={(e) => setNewDevName(e.target.value)}
            placeholder="e.g. Sumadhura Group"
            className="input flex-1 min-w-[240px]"
          />
          <button onClick={createDeveloper} disabled={busy || !newDevName.trim()} className="btn-neon text-sm">
            Add developer
          </button>
        </div>
        {developers.length > 0 && (
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {developers.map((d) => (
              <li key={d.id} className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                <p className="font-medium">{d.name}</p>
                <p className="text-[11px] text-ink-dim">/{d.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-xl">Invite developer user</h3>
        <p className="text-xs text-ink-muted mt-1">
          Sends a welcome email. They can sign in immediately at /developer-portal/login with email-OTP.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Full name" className="input" />
          <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@developer.com" className="input" />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="input">
            <option value="viewer">Viewer (read only)</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={inviteDevId ?? ''}
            onChange={(e) => setInviteDevId(Number(e.target.value))}
            className="input"
          >
            {developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <button
          onClick={invite}
          disabled={busy || !inviteEmail || !inviteName || !inviteDevId}
          className="btn-neon text-sm mt-4"
        >
          Send invite
        </button>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="font-display text-xl">Existing developer users</h3>
        <div className="mt-4 grid gap-2">
          {users.length === 0 && <p className="text-ink-muted text-sm">No users invited yet.</p>}
          {users.map((u) => (
            <div key={u.id} className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-medium truncate">{u.full_name}</p>
                <p className="text-xs text-ink-muted truncate">{u.email} · {u.developer_name} · {u.role}</p>
                {u.last_login_at && (
                  <p className="text-[11px] text-ink-dim">Last login: {new Date(u.last_login_at).toLocaleString('en-IN')}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {u.status === 'suspended' ? (
                  <span className="chip text-orange-300 border-orange-300/30">Suspended</span>
                ) : (
                  <span className="chip text-emerald-300 border-emerald-300/30">Active</span>
                )}
                <button
                  onClick={() => suspendUser(u.id, u.status !== 'suspended')}
                  disabled={busy}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  disabled={busy}
                  className="text-xs text-ink-dim hover:text-neon-pink"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
