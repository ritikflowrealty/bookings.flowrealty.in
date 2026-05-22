import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { getSettings, setting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Life at Flow | Culture & Careers | Flow Realty',
  description: 'Behind the scenes at Flow Realty. Team testimonials, culture, and open roles.',
};

export default async function LifeAtFlowPage() {
  const s = await getSettings();
  const teamSize = setting(s, 'team_size', '80');

  return (
    <>
      <Navbar />
      <main className="pt-8 pb-12">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Life at Flow</span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl tracking-tight leading-[1.05]">
              Build something that matters.
            </h1>
            <p className="mt-4 max-w-2xl text-ink-muted leading-relaxed">
              {teamSize}+ people from Tier-A brands and B-schools. One mission: make real estate sales predictable.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-16">
            <h2 className="font-display text-3xl tracking-tight">Our values</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <ValueCard title="Performance" body="We measure everything. If it doesn't move the number, we don't do it." />
              <ValueCard title="Partnership" body="Developers are partners, not clients. Their cashflow problem is our problem." />
              <ValueCard title="Craft" body="Every walk-in matters. Every follow-up is on time. Every report is accurate." />
            </div>
          </SectionReveal>

          <SectionReveal className="mt-16">
            <h2 className="font-display text-3xl tracking-tight">Open roles</h2>
            <p className="mt-3 text-ink-muted leading-relaxed">
              We&rsquo;re always looking for sharp people in sales, marketing, customer success,
              technology, operations, and finance. Drop us a note even if there&rsquo;s no role listed.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/careers" className="btn-neon">View careers</Link>
              <Link href="/team" className="btn-ghost">Meet the team</Link>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}
