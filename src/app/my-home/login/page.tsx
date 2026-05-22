import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Home Sign In | Flow Realty',
};

export default async function CustomerLogin() {
  const session = await auth();
  if (session?.portals?.includes('customer')) redirect('/my-home/dashboard');

  return (
    <>
      <Navbar />
      <main className="pt-8 pb-20">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">My Home</span>
            <h1 className="mt-4 font-display text-3xl tracking-tight">Sign in</h1>
            <p className="mt-2 text-ink-muted">
              Sign in with the Google account you used during booking.
            </p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <GoogleSignInButton callbackUrl="/my-home/dashboard" />
              <p className="mt-6 text-xs text-ink-dim">
                Don&rsquo;t have an account yet? Reach out to your Flow Realty sales contact.
              </p>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
