import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { auth } from '@/auth';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign in | Flow Realty',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; portal?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl || routeForPortals(session?.portals);

  // Already signed in? Send to the right portal.
  if (session?.user?.email && session.portals && session.portals.length > 0) {
    redirect(callbackUrl);
  }

  const portalLabel = sp.portal === 'developer' ? 'Developer Portal'
    : sp.portal === 'customer' ? 'My Home'
    : sp.portal === 'cp' ? 'Bro Portal'
    : 'Flow Realty';

  return (
    <>
      <Navbar />
      <main className="pb-12">
        <div className="mx-auto max-w-md px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Sign in</span>
            <h1 className="mt-4 font-display text-3xl tracking-tight">{portalLabel}</h1>
            <p className="mt-2 text-ink-muted">
              Sign in with the Google account approved by Flow Realty.
            </p>
          </SectionReveal>
          <SectionReveal className="mt-8">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <GoogleSignInButton callbackUrl={callbackUrl} />
              <p className="mt-6 text-xs text-ink-dim">
                If your email isn&rsquo;t recognised, you&rsquo;ll be taken to a page explaining how to register or get access.
              </p>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

function routeForPortals(p?: Array<'cp' | 'developer' | 'customer'>): string {
  if (!p?.length) return '/';
  if (p.includes('cp')) return '/bro-portal/dashboard';
  if (p.includes('developer')) return '/developer-portal/dashboard';
  return '/my-home/dashboard';
}
