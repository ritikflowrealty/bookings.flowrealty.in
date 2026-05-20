import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { auth, signOut } from '@/auth';
import { ensureSchema, getDb, rowsAs } from '@/lib/db';
import { PushOptIn } from '@/components/PushOptIn';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Developer Dashboard | Flow Realty',
};

type StatRow = {
  total_projects: number;
  total_bookings: number;
  paid_bookings: number;
  walkins_30d: number;
  walkins_7d: number;
  leads_30d: number;
};

export default async function DeveloperDashboard() {
  const session = await auth();
  if (!session?.developerId) redirect('/developer-portal/login');

  await ensureSchema();
  const db = getDb();

  const userRow = await db.execute({
    sql: `SELECT du.id, du.full_name, du.email, du.developer_id, du.role, d.name AS developer_name
          FROM developer_users du
          JOIN developers d ON d.id = du.developer_id
          WHERE LOWER(du.email) = ? LIMIT 1`,
    args: [(session.user?.email || '').toLowerCase()],
  });
  const user = rowsAs<{
    id: number;
    full_name: string;
    email: string;
    developer_id: number;
    role: string;
    developer_name: string;
  }>(userRow)[0];
  if (!user) redirect('/developer-portal/login');

  // All bookings + walkins are scoped to projects where developer matches developer.name
  // (We use the textual developer field on projects for now since project↔developer link
  // is by name; admins can later add a developer_id FK if they want strict matching.)
  const stats = await db.execute({
    sql: `SELECT
            (SELECT COUNT(*) FROM projects WHERE developer = ? AND is_visible = 1) AS total_projects,
            (SELECT COUNT(*) FROM bookings b JOIN projects p ON p.id = b.project_id WHERE p.developer = ?) AS total_bookings,
            (SELECT COUNT(*) FROM bookings b JOIN projects p ON p.id = b.project_id WHERE p.developer = ? AND b.status = 'paid') AS paid_bookings,
            (SELECT COUNT(*) FROM walkins w JOIN projects p ON p.id = w.project_id WHERE p.developer = ? AND w.walkin_date >= datetime('now', '-30 days')) AS walkins_30d,
            (SELECT COUNT(*) FROM walkins w JOIN projects p ON p.id = w.project_id WHERE p.developer = ? AND w.walkin_date >= datetime('now', '-7 days')) AS walkins_7d,
            (SELECT COUNT(*) FROM leads l JOIN projects p ON p.id = l.project_id WHERE p.developer = ? AND l.created_at >= datetime('now', '-30 days')) AS leads_30d`,
    args: [
      user.developer_name, user.developer_name, user.developer_name,
      user.developer_name, user.developer_name, user.developer_name,
    ],
  });
  const s = (rowsAs<StatRow>(stats)[0] || {}) as StatRow;

  const projectsRows = await db.execute({
    sql: `SELECT p.id, p.slug, p.name, p.city, p.is_visible, p.booking_enabled,
                 (SELECT COUNT(*) FROM bookings b WHERE b.project_id = p.id) AS booking_count,
                 (SELECT COUNT(*) FROM bookings b WHERE b.project_id = p.id AND b.status = 'paid') AS paid_count,
                 (SELECT COUNT(*) FROM walkins w WHERE w.project_id = p.id AND w.walkin_date >= datetime('now', '-30 days')) AS walkins_30d
          FROM projects p
          WHERE p.developer = ?
          ORDER BY p.name`,
    args: [user.developer_name],
  });
  const projects = projectsRows.rows as unknown as {
    id: number; slug: string; name: string; city: string;
    is_visible: number; booking_enabled: number;
    booking_count: number; paid_count: number; walkins_30d: number;
  }[];

  // Recent leads — anonymized (NO CP names per spec)
  const leadsRows = await db.execute({
    sql: `SELECT l.reference_number, l.prospect_first_name, l.prospect_last_name,
                 l.configuration, l.budget_range, l.status, l.created_at,
                 p.name AS project_name
          FROM leads l
          JOIN projects p ON p.id = l.project_id
          WHERE p.developer = ?
          ORDER BY l.created_at DESC
          LIMIT 12`,
    args: [user.developer_name],
  });
  const leads = leadsRows.rows as unknown as {
    reference_number: string; prospect_first_name: string; prospect_last_name: string;
    configuration: string; budget_range: string; status: string; created_at: string;
    project_name: string;
  }[];

  return (
    <>
      <Navbar />
      <main className="pt-10 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="label">Developer Portal</p>
              <h1 className="mt-1 font-display text-3xl tracking-tight">{user.developer_name}</h1>
              <p className="text-xs text-ink-dim mt-1">Signed in as {user.full_name} · {user.role}</p>
            </div>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
              <button type="submit" className="btn-ghost text-sm">Sign out</button>
            </form>
          </div>

          <SectionReveal className="mt-8">
            <PushOptIn portal="developer" />
          </SectionReveal>

          <SectionReveal className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Stat label="Live projects" value={Number(s.total_projects ?? 0)} />
              <Stat label="Total bookings" value={Number(s.total_bookings ?? 0)} />
              <Stat label="Paid" value={Number(s.paid_bookings ?? 0)} />
              <Stat label="Walk-ins · 7d" value={Number(s.walkins_7d ?? 0)} />
              <Stat label="Walk-ins · 30d" value={Number(s.walkins_30d ?? 0)} />
              <Stat label="Leads · 30d" value={Number(s.leads_30d ?? 0)} />
            </div>
          </SectionReveal>

          <SectionReveal className="mt-12">
            <h2 className="font-display text-2xl">Your projects</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.length === 0 && (
                <p className="text-ink-muted">No projects assigned yet.</p>
              )}
              {projects.map((p) => (
                <article key={p.id} className="glass rounded-2xl p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{p.city}</p>
                  <h3 className="mt-1 font-display text-lg">{p.name}</h3>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <Mini label="Bookings" value={p.booking_count} />
                    <Mini label="Paid" value={p.paid_count} />
                    <Mini label="Walk-ins 30d" value={p.walkins_30d} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {p.is_visible ? (
                      <span className="chip text-emerald-300 border-emerald-300/30">Visible</span>
                    ) : (
                      <span className="chip text-amber-300 border-amber-300/30">Hidden</span>
                    )}
                    {p.booking_enabled ? (
                      <span className="chip text-emerald-300 border-emerald-300/30">Booking on</span>
                    ) : (
                      <span className="chip text-ink-dim">Booking off</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal className="mt-12">
            <h2 className="font-display text-2xl">Recent leads</h2>
            <p className="text-xs text-ink-dim mt-1">CP names are not shown by policy.</p>
            <div className="mt-4 glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-left">
                    <tr>
                      <Th>Reference</Th>
                      <Th>Project</Th>
                      <Th>Prospect</Th>
                      <Th>Config</Th>
                      <Th>Budget</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length ? leads.map((l) => (
                      <tr key={l.reference_number} className="border-t border-white/5">
                        <Td mono>{l.reference_number}</Td>
                        <Td>{l.project_name}</Td>
                        <Td>{l.prospect_first_name} {l.prospect_last_name?.[0] ? l.prospect_last_name[0] + '.' : ''}</Td>
                        <Td>{l.configuration || '—'}</Td>
                        <Td>{l.budget_range || '—'}</Td>
                        <Td><Pill>{l.status}</Pill></Td>
                        <Td>{new Date(l.created_at).toLocaleDateString('en-IN')}</Td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="py-8 text-center text-ink-muted">No leads yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="label">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/[0.03] p-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-ink-dim">{label}</p>
      <p className="mt-0.5 font-display">{value}</p>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">{children}</th>;
}
function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td className={`px-4 py-3 ${mono ? 'font-mono text-xs' : ''}`}>{children}</td>;
}
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider border border-white/10 bg-white/5">{children}</span>;
}
