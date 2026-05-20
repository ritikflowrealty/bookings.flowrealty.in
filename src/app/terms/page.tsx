import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Terms & Conditions | Flow Realty',
  description: 'Terms and conditions for using Flow Realty services and the booking platform.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 lg:px-8 py-16 pb-24">
        <h1 className="font-display text-4xl tracking-tight">Terms & Conditions</h1>
        <p className="mt-2 text-ink-muted">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <Section title="1. Acceptance of terms">
          By accessing booking.flowrealty.in (the &ldquo;Platform&rdquo;) and any related services
          provided by Flow Realty, you agree to be bound by these terms.
        </Section>
        <Section title="2. Provisional booking">
          All bookings made through the Platform are provisional. Final allocation is at the
          discretion of the developer subject to RERA approvals, payment clearance, and
          Flow Realty&rsquo;s sales review.
        </Section>
        <Section title="3. Refunds">
          Refunds for provisional bookings are subject to the developer&rsquo;s policy and may
          require deductions for processing. Refund requests must be raised within 7 days of
          booking via the contact channels listed.
        </Section>
        <Section title="4. Channel partners">
          Channel partners registering on the Bro Portal must provide accurate KYC documents.
          Misrepresentation may lead to suspension and forfeiture of pending commissions.
        </Section>
        <Section title="5. Limitation of liability">
          Flow Realty acts as a sales partner. Construction, possession, and final unit
          allocation are the responsibility of the respective developer. We make best efforts
          to verify projects but do not guarantee outcomes outside our scope of service.
        </Section>
        <Section title="6. Governing law">
          These terms are governed by the laws of India. Any disputes will be resolved in the
          courts of Bangalore, Karnataka.
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-2 text-ink-muted leading-relaxed">{children}</p>
    </section>
  );
}
