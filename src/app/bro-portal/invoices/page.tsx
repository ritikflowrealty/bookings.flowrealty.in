import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { auth } from '@/auth';
import { ensureSchema, getDb, rowsAs } from '@/lib/db';
import { CPInvoiceTab } from './CPInvoiceTab';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'My Invoices | Flow Realty Bro Portal' };

export default async function CPInvoicesPage() {
  const session = await auth();
  if (!session?.cpId) redirect('/bro-portal/login');

  await ensureSchema();
  const db = getDb();

  const cpRow = await db.execute({
    sql: `SELECT id, full_name, status FROM channel_partners WHERE id = ? LIMIT 1`,
    args: [session.cpId],
  });
  const cp = rowsAs<{ id: number; full_name: string; status: string }>(cpRow)[0];
  if (!cp || cp.status !== 'approved') redirect('/bro-portal/login');

  const [leadsRow, invoicesRow] = await Promise.all([
    db.execute({
      sql: `SELECT l.id, l.reference_number, l.prospect_first_name, l.prospect_last_name, l.status, p.name AS project_name
            FROM leads l LEFT JOIN projects p ON p.id = l.project_id
            WHERE l.channel_partner_id = ? AND l.status IN ('booked', 'site_visit', 'qualified')
            ORDER BY l.created_at DESC`,
      args: [cp.id],
    }),
    db.execute({
      sql: `SELECT i.*, l.reference_number AS lead_ref, p.name AS project_name
            FROM cp_invoices i
            LEFT JOIN leads l ON l.id = i.lead_id
            LEFT JOIN bookings b ON b.id = i.booking_id
            LEFT JOIN projects p ON p.id = COALESCE(l.project_id, b.project_id)
            WHERE i.channel_partner_id = ?
            ORDER BY i.created_at DESC`,
      args: [cp.id],
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="pt-10 pb-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <SectionReveal>
            <p className="text-xs text-ink-muted">
              <a href="/bro-portal/dashboard" className="hover:text-ink">← Back to dashboard</a>
            </p>
            <h1 className="mt-3 font-display text-3xl tracking-tight">My invoices</h1>
            <p className="mt-2 text-ink-muted">Submit invoices once your leads are qualified or booked.</p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <CPInvoiceTab leads={leadsRow.rows as any} invoices={invoicesRow.rows as any} />
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
