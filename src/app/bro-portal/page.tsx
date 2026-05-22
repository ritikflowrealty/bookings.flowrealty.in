import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Channel Partner Portal | Bro Portal | Flow Realty',
  description:
    'Register as a channel partner with Flow Realty. Submit leads, track bookings, upload invoices, and earn from India\'s most trusted developer network.',
};

const benefits = [
  { title: '1000+ CPs already onboard', body: 'Join the largest CP distribution network in South India.' },
  { title: 'Verified projects only', body: 'Every project on the platform is RERA-registered and walked by Flow.' },
  { title: 'Transparent payouts', body: 'Submit your invoice from the portal. Track approval and payment status live.' },
  { title: 'One login, all developers', body: 'Stop juggling 15 broker apps. Manage every lead from one dashboard.' },
];

export default function BroPortalLanding() {
  return (
    <>
      <Navbar />
      <main className="pb-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Bro Portal</span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl tracking-tight">
              The channel partner network
              <br />
              <span className="neon-text">that pays on time.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-ink-muted leading-relaxed">
              Register once, get verified, and start submitting leads against any project on the
              platform. No paperwork chases. No payment delays.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bro-portal/register" className="btn-neon">
                Register as Channel Partner
              </Link>
              <Link href="/bro-portal/login" className="btn-ghost">
                Existing CP? Sign in
              </Link>
            </div>
          </SectionReveal>

          <SectionReveal className="mt-20">
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
              Why CPs choose Flow.
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {benefits.map((b) => (
                <div key={b.title} className="glass rounded-2xl p-6">
                  <h3 className="font-display text-xl">{b.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
