import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';

export const dynamic = 'force-dynamic';

const REASONS: Record<string, { title: string; body: string; cta: { label: string; href: string }[] }> = {
  not_approved: {
    title: 'This Google account isn\'t approved yet.',
    body: 'Your email isn\'t in our system. If you\'re a channel partner, please register first. Otherwise reach out to your Flow Realty contact.',
    cta: [
      { label: 'Register as Channel Partner', href: '/bro-portal/register' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  cp_pending: {
    title: 'Your CP registration is still under review.',
    body: 'Our team reviews registrations within 24 hours. You\'ll be able to sign in once approved. Sit tight.',
    cta: [{ label: 'Back to home', href: '/' }],
  },
  cp_rejected: {
    title: 'Your CP registration was not approved.',
    body: 'You can re-register with corrected details, or reach out to our team for help.',
    cta: [
      { label: 'Re-register', href: '/bro-portal/register' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  cp_suspended: {
    title: 'Your CP account has been suspended.',
    body: 'Reach out to our team to resolve this.',
    cta: [{ label: 'Contact us', href: '/contact' }],
  },
  Configuration: {
    title: 'Sign-in is temporarily unavailable.',
    body: 'There was a server-side configuration issue. Please try again shortly.',
    cta: [{ label: 'Back to home', href: '/' }],
  },
  AccessDenied: {
    title: 'Access denied.',
    body: 'This Google account isn\'t allowed to sign in.',
    cta: [{ label: 'Back to home', href: '/' }],
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; error?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const key = sp.reason || sp.error || 'not_approved';
  const config = REASONS[key] || REASONS.not_approved;

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-2xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Sign in</span>
            <h1 className="mt-4 font-display text-4xl tracking-tight leading-[1.1]">{config.title}</h1>
            {sp.email && (
              <p className="mt-3 text-sm text-ink-dim">Tried with: <span className="text-ink-muted">{sp.email}</span></p>
            )}
            <p className="mt-4 text-ink-muted leading-relaxed">{config.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {config.cta.map((c) => (
                <Link key={c.href} href={c.href} className="btn-neon">{c.label}</Link>
              ))}
              <Link href="/auth/signin" className="btn-ghost">Try a different Google account</Link>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
