import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { auth, signOut } from '@/auth';
import { ensureSchema, getDb, rowsAs } from '@/lib/db';
import { PushOptIn } from '@/components/PushOptIn';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Home | Flow Realty',
};

const STAGES = [
  { key: 'announced', label: 'Project announced' },
  { key: 'foundation', label: 'Foundation' },
  { key: 'structure', label: 'Structure' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'ready', label: 'Ready to move' },
  { key: 'handover', label: 'Handover' },
];

function stageProgress(stage: string): number {
  const idx = STAGES.findIndex((s) => s.key === stage);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / STAGES.length) * 100);
}

export default async function CustomerDashboard() {
  const session = await auth();
  if (!session?.customerId) redirect('/my-home/login');

  await ensureSchema();
  const db = getDb();

  const userRow = await db.execute({
    sql: `SELECT id, full_name, email, mobile FROM customer_users WHERE id = ? LIMIT 1`,
    args: [session.customerId],
  });
  const user = rowsAs<{ id: number; full_name: string; email: string; mobile: string }>(userRow)[0];
  if (!user) redirect('/my-home/login');

  const [unitsRows, docsRows, notifsRows] = await Promise.all([
    db.execute({
      sql: `SELECT cu.*, p.name AS project_name, p.developer AS project_developer, p.city AS project_city, p.image_url AS project_image
            FROM customer_units cu
            JOIN projects p ON p.id = cu.project_id
            WHERE cu.customer_id = ?
            ORDER BY cu.id DESC`,
      args: [user.id],
    }),
    db.execute({
      sql: `SELECT * FROM customer_documents WHERE customer_id = ? ORDER BY uploaded_at DESC`,
      args: [user.id],
    }),
    db.execute({
      sql: `SELECT * FROM customer_notifications WHERE customer_id = ? ORDER BY created_at DESC LIMIT 30`,
      args: [user.id],
    }),
  ]);

  const units = unitsRows.rows as unknown as {
    id: number; tower_unit: string; configuration: string; carpet_area_sqft: number;
    total_value: number; construction_stage: string; expected_possession: string | null;
    project_name: string; project_developer: string; project_city: string; project_image: string;
  }[];
  const docs = docsRows.rows as unknown as {
    id: number; doc_type: string; title: string; doc_url: string; uploaded_at: string; unit_id: number | null;
  }[];
  const notifs = notifsRows.rows as unknown as {
    id: number; title: string; body: string; type: string; is_read: number; created_at: string;
  }[];

  return (
    <>
      <Navbar />
      <main className="pt-10 pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="label">My Home</p>
              <h1 className="mt-1 font-display text-3xl tracking-tight">Welcome back, {user.full_name.split(' ')[0]}.</h1>
            </div>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
              <button type="submit" className="btn-ghost text-sm">Sign out</button>
            </form>
          </div>

          <SectionReveal className="mt-10">
            <PushOptIn portal="customer" />
          </SectionReveal>

          <SectionReveal className="mt-10">
            <h2 className="font-display text-2xl">Your unit{units.length > 1 ? 's' : ''}</h2>
            <div className="mt-4 grid grid-cols-1 gap-5">
              {units.length === 0 && (
                <div className="glass rounded-3xl p-12 text-center text-ink-muted">
                  No units linked to your account yet. Reach out to your sales contact at Flow Realty.
                </div>
              )}
              {units.map((u) => (
                <article key={u.id} className="glass-strong rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    {u.project_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.project_image} alt={u.project_name} className="w-full aspect-[4/3] object-cover rounded-2xl" />
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-orange/20" />
                    )}
                  </div>
                  <div className="lg:col-span-8">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                      {u.project_developer} · {u.project_city}
                    </p>
                    <h3 className="mt-1 font-display text-2xl">{u.project_name}</h3>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Mini label="Unit" value={u.tower_unit || '—'} />
                      <Mini label="Config" value={u.configuration || '—'} />
                      <Mini label="Carpet" value={u.carpet_area_sqft ? `${u.carpet_area_sqft} sqft` : '—'} />
                      <Mini label="Value" value={u.total_value ? `₹${(u.total_value / 100000).toFixed(2)} L` : '—'} />
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs">
                        <p className="label">Construction stage</p>
                        <p className="text-ink-muted">{stageProgress(u.construction_stage)}%</p>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-neon-gradient transition-all duration-700"
                          style={{ width: `${stageProgress(u.construction_stage)}%` }}
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {STAGES.map((s) => {
                          const idx = STAGES.findIndex((x) => x.key === u.construction_stage);
                          const me = STAGES.findIndex((x) => x.key === s.key);
                          const reached = me <= idx;
                          return (
                            <div
                              key={s.key}
                              className={`text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-md text-center ${
                                reached ? 'text-ink bg-white/[0.06]' : 'text-ink-dim bg-white/[0.02]'
                              }`}
                            >
                              {s.label}
                            </div>
                          );
                        })}
                      </div>
                      {u.expected_possession && (
                        <p className="mt-3 text-xs text-ink-muted">
                          Expected possession: <strong className="text-ink">{u.expected_possession}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-display text-xl">Documents</h3>
              <p className="text-xs text-ink-muted mt-1">Agreements, payment receipts, NOCs.</p>
              <ul className="mt-4 space-y-2">
                {docs.length === 0 && <li className="text-ink-muted text-sm">No documents shared yet.</li>}
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{d.title}</p>
                      <p className="text-[11px] text-ink-dim uppercase tracking-wider">{d.doc_type}</p>
                    </div>
                    <a href={d.doc_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5 shrink-0">
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-display text-xl">Notifications</h3>
              <ul className="mt-4 space-y-2">
                {notifs.length === 0 && <li className="text-ink-muted text-sm">No notifications.</li>}
                {notifs.map((n) => (
                  <li key={n.id} className={`rounded-xl px-4 py-3 ${n.is_read ? 'bg-white/[0.02]' : 'bg-white/[0.05] border-l-2 border-l-neon-magenta'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <span className="text-[10px] text-ink-dim uppercase tracking-wider">{n.type}</span>
                    </div>
                    {n.body && <p className="text-xs text-ink-muted mt-1">{n.body}</p>}
                    <p className="text-[11px] text-ink-dim mt-1">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-wider text-ink-dim">{label}</p>
      <p className="mt-0.5 font-display text-sm">{value}</p>
    </div>
  );
}
