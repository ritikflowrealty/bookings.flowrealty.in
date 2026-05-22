import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Developer Sign In | Flow Realty',
};

export default async function DeveloperLogin() {
  const session = await auth();
  if (session?.portals?.includes('developer')) redirect('/developer-portal/dashboard');

  return (
    <>
      <Navbar />
      <main className="pt-8 pb-20">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Developer Portal</span>
            <h1 className="mt-4 font-display text-3xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-ink-muted">
              Sign in with the Google account invited by Flow Realty.
            </p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <GoogleSignInButton callbackUrl="/developer-portal/dashboard" />
              <p className="mt-6 text-xs text-ink-dim">
                Access is by invitation only. Reach out to your Flow Realty contact if you need access.
              </p>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
