import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { OtpLoginForm } from '@/components/OtpLoginForm';

export const metadata = {
  title: 'Developer Sign In | Flow Realty',
  description: 'Sign in to the Flow Realty developer portal to view your projects, bookings and walk-ins.',
};

export default function DeveloperLogin() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Developer Portal</span>
            <h1 className="mt-4 font-display text-3xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-ink-muted">
              Enter your invited email. We&rsquo;ll send a 6-digit code to sign in.
            </p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <OtpLoginForm portal="developer" redirectTo="/developer-portal/dashboard" />
              <p className="mt-6 text-xs text-ink-dim">
                Access is by invitation only. Reach out to your Flow Realty contact if you need
                access.
              </p>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
