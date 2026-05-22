import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Channel Partner Sign In | Flow Realty Bro Portal',
};

export default async function CPLogin() {
  const session = await auth();
  if (session?.portals?.includes('cp')) redirect('/bro-portal/dashboard');

  return (
    <>
      <Navbar />
      <main className="pb-12">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Bro Portal</span>
            <h1 className="mt-4 font-display text-3xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-ink-muted">
              Sign in with the Google account you registered with.
            </p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <GoogleSignInButton callbackUrl="/bro-portal/dashboard" />
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
