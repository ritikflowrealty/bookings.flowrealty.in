import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { OtpLoginForm } from '@/components/OtpLoginForm';

export const metadata = {
  title: 'Channel Partner Sign In | Flow Realty Bro Portal',
  description: 'Sign in to the Flow Realty Channel Partner portal with your registered email.',
};

export default function CPLogin() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Bro Portal</span>
            <h1 className="mt-4 font-display text-3xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-ink-muted">Enter your registered email. We&rsquo;ll send a 6-digit code to sign in.</p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <OtpLoginForm portal="cp" redirectTo="/bro-portal/dashboard" />
              <p className="mt-6 text-xs text-ink-dim">
                Not registered yet? <a href="/bro-portal/register" className="text-ink hover:underline">Register as CP</a>
              </p>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
