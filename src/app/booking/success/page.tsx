import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getBookingByReference } from '@/lib/bookings';
import { getProjectById } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const ref = (sp?.ref || '').slice(0, 64);
  const booking = ref ? await getBookingByReference(ref) : null;
  const project = booking ? await getProjectById(booking.project_id) : null;

  return (
    <>
      <Navbar />
      <main className="relative">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 py-20">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-neon-gradient flex items-center justify-center shadow-glow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-6 font-display text-4xl tracking-tight">Booking confirmed</h1>
            <p className="mt-2 text-ink-muted">
              Your provisional booking has been received. Our sales team will reach out within 24
              hours.
            </p>

            {booking && project && (
              <dl className="mt-8 grid grid-cols-2 gap-3 text-left">
                <Row label="Reference" value={booking.reference_number} />
                <Row label="Project" value={`${project.name} · ${project.developer}`} />
                <Row label="Name" value={booking.full_name} />
                <Row label="Mobile" value={booking.mobile} />
                <Row label="Unit" value={booking.tower_unit} />
                <Row
                  label="Amount"
                  value={`₹${Number(booking.amount).toLocaleString('en-IN')}`}
                />
                <Row label="Date" value={new Date(booking.updated_at).toLocaleString('en-IN')} />
                <Row label="Status" value="Paid" />
              </dl>
            )}

            <div className="mt-10 flex items-center justify-center gap-3">
              <Link href="/" className="btn-ghost">Back to home</Link>
              <Link href="/#projects" className="btn-neon">Browse more</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink break-words">{value}</dd>
    </div>
  );
}
