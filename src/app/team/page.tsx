import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Team Flow | Leadership & Co-founders | Flow Realty',
  description:
    'Meet the leadership team behind Flow Realty. 75+ professionals from Tier-A brands and B-schools driving real estate sales for India\'s top developers.',
};

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Team Flow</span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl tracking-tight">
              The minds behind the moves.
            </h1>
            <p className="mt-4 max-w-2xl text-ink-muted leading-relaxed">
              Flow Realty is run by a 75-strong team from Tier-A brands and B-schools. Co-founders,
              leadership and a network that knows India&rsquo;s real estate inside out.
            </p>
          </SectionReveal>

          <div className="mt-16 glass rounded-3xl p-12 text-center">
            <p className="text-ink-muted">Team profiles coming soon. Edit them from the admin panel.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
