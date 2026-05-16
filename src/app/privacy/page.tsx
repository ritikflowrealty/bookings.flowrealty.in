import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 lg:px-8 py-16">
        <h1 className="font-display text-4xl tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-ink-muted">Last updated: {new Date().toLocaleDateString('en-IN')}</p>

        <Section title="Who we are">
          Flow Realty is a sales partner for premium residential developers across South India. This
          page explains what we collect when you book a unit on booking.flowrealty.in and how we
          protect that information.
        </Section>

        <Section title="What we collect">
          When you make a provisional booking we collect your full name, email, mobile number,
          preferred tower and unit, booking amount, and optional address details. We also receive a
          payment identifier from Razorpay after a successful transaction.
        </Section>

        <Section title="What we do not store">
          We do not store any card numbers, CVV, OTP, UPI PIN, or net banking credentials. All
          payment data is handled by Razorpay, which is PCI DSS compliant.
        </Section>

        <Section title="How we use your data">
          We use your contact details to confirm your provisional booking, schedule site visits,
          and share information about the project you booked. We share your details with the
          developer of the project you booked so their team can reach you.
        </Section>

        <Section title="Retention">
          Booking records and audit logs are retained for 365 days for compliance and dispute
          resolution. After this period the records are deleted or anonymised.
        </Section>

        <Section title="Security">
          The site is served only over HTTPS with TLS 1.2 or above. Inputs are validated and
          sanitised on the server. Admin access is gated by a server-side password.
        </Section>

        <Section title="Your choices">
          To request access, correction, or deletion of your data, write to us at
          <a className="text-ink underline ml-1" href="mailto:hello@flowrealty.in">
            hello@flowrealty.in
          </a>
          . We respond within 30 days.
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
