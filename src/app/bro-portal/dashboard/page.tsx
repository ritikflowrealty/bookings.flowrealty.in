import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { auth, signOut } from '@/auth';
import { ensureSchema, getDb, rowsAs } from '@/lib/db';
import { listVisibleProjects } from '@/lib/projects';
import { PushOptIn } from '@/components/PushOptIn';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CP Dashboard | Flow Realty Bro Portal',
};

export default async function CPDashboard() {
  const session = await auth();
  if (!session?.cpId) redirect('/bro-portal/login');

  await ensureSchema();
  const db = getDb();

  const cpRow = await db.execute({
    sql: `SELECT id, full_name, email, status FROM channel_partners WHERE id = ? LIMIT 1`,
    args: [session.cpId],
  });
  const cp = rowsAs<{ id: number; full_name: string; email: string; status: string }>(cpRow)[0];
  if (!cp) redirect('/bro-portal/login');
  if (cp.status !== 'approved') {
    return (
      <>
        <Navbar />
        <main className="pb-12">
          <div className="mx-auto max-w-2xl px-5 lg:px-8 text-center">
            <SectionReveal>
              <span className="chip">Bro Portal</span>
              <h1 className="mt-4 font-display text-3xl tracking-tight">Approval pending</h1>
              <p className="mt-3 text-ink-muted">
                Your registration is being reviewed. We&rsquo;ll email you the moment you&rsquo;re approved.
              </p>
            </SectionReveal>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const [statsRow, projects, recentLeads] = await Promise.all([
    db.execute({
      sql: `SELECT
              (SELECT COUNT(*) FROM leads WHERE channel_partner_id = ?) AS total,
              (SELECT COUNT(*) FROM leads WHERE channel_partner_id = ? AND status IN ('site_visit', 'qualified')) AS qualified,
              (SELECT COUNT(*) FROM leads WHERE channel_partner_id = ? AND status = 'booked') AS booked,
              (SELECT COUNT(*) FROM cp_invoices WHERE channel_partner_id = ? AND status = 'paid') AS paid_invoices`,
      args: [cp.id, cp.id, cp.id, cp.id],
    }),
    listVisibleProjects(),
    db.execute({
      sql: `SELECT l.*, p.name as project_name FROM leads l
            LEFT JOIN projects p ON p.id = l.project_id
            WHERE l.channel_partner_id = ?
            ORDER BY l.created_at DESC LIMIT 8`,
      args: [cp.id],
    }),
  ]);

  const stats = (statsRow.rows[0] || {}) as Record<string, number>;
  const leads = recentLeads.rows as any[];

  return (
    <>
      <Navbar />
      <main className="pt-10 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="label">Bro Portal</p>
              <h1 className="mt-1 font-display text-3xl tracking-tight">Welcome, {cp.full_name.split(' ')[0]}.</h1>
            </div>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
              <button type="submit" className="btn-ghost text-sm">Sign out</button>
            </form>
          </div>

          <SectionReveal className="mt-8">
            <PushOptIn portal="cp" />
          </SectionReveal>

          <SectionReveal className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Total leads" value={Number(stats.total ?? 0)} />
              <Stat label="Qualified" value={Number(stats.qualified ?? 0)} />
              <Stat label="Booked" value={Number(stats.booked ?? 0)} />
              <Stat label="Paid invoices" value={Number(stats.paid_invoices ?? 0)} />
            </div>
          </SectionReveal>

          <SectionReveal className="mt-12">
            <h2 className="font-display text-2xl">Submit a new lead</h2>
            <p className="text-ink-muted mt-1">Pick the project to register your lead against.</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/bro-portal/projects/${p.slug}/lead`}
                  className="glass rounded-2xl p-5 hover:bg-white/[0.06] transition-colors block"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{p.developer} · {p.city}</p>
                  <h3 className="mt-1 font-display text-lg">{p.name}</h3>
                  <p className="mt-2 text-xs text-ink-dim">Register lead →</p>
                </Link>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal className="mt-12">
            <h2 className="font-display text-2xl">Recent leads</h2>
            <div className="mt-4 glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-left">
                    <tr>
                      <Th>Reference</Th>
                      <Th>Project</Th>
                      <Th>Prospect</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length ? leads.map((l) => (
                      <tr key={l.id} className="border-t border-white/5">
                        <Td mono>{l.reference_number}</Td>
                        <Td>{l.project_name || '—'}</Td>
                        <Td>{l.prospect_first_name} {l.prospect_last_name}</Td>
                        <Td><Pill>{l.status}</Pill></Td>
                        <Td>{new Date(l.created_at).toLocaleDateString('en-IN')}</Td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-8 text-center text-ink-muted">No leads yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href="/bro-portal/leads" className="btn-ghost text-sm">View all leads</Link>
              <Link href="/bro-portal/invoices" className="btn-ghost text-sm">Invoices</Link>
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
      <p className="mt-2 font-display text-3xl">{value}</p>
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
