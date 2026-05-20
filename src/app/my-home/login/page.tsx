import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { OtpLoginForm } from '@/components/OtpLoginForm';

export const metadata = {
  title: 'My Home Sign In | Flow Realty',
  description: 'Sign in to your Flow Realty home portal to track construction stage, documents, and notifications for your booked unit.',
};

export default function CustomerLogin() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">My Home</span>
            <h1 className="mt-4 font-display text-3xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-ink-muted">
              Enter the email you used while booking. We&rsquo;ll send a 6-digit code.
            </p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <OtpLoginForm portal="customer" redirectTo="/my-home/dashboard" />
              <p className="mt-6 text-xs text-ink-dim">
                Don&rsquo;t have an account yet? Reach out to your sales contact.
              </p>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
