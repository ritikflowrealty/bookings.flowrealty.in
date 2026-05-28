import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { CareersForm } from '@/components/CareersForm';
import { getSettings, setting } from '@/lib/settings';

export const metadata = {
  title: 'Careers at Flow Realty | Real Estate Sales Roles',
  description:
    "Join the team that powers India's biggest real estate sales engine. Apply with your CV in under two minutes — open roles in sales, marketing, technology, and operations.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function CareersPage() {
  const s = await getSettings();
  const teamSize = setting(s, 'team_size', '75');

  return (
    <>
      <Navbar />
      <main className="py-12">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Careers</span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl tracking-tight leading-[1.05]">
              Build the sales engine
              <br />
              <span className="neon-text">behind India&rsquo;s best homes.</span>
            </h1>
          </SectionReveal>

          <SectionReveal className="mt-10">
            <p className="text-lg text-ink-muted leading-relaxed">
              Flow Realty is a {teamSize}-person team from Tier-A brands and B-schools. We work
              on the hardest sales problems in residential real estate: turning around stuck
              projects, launching new ones at velocity, and building the technology that runs
              underneath all of it.
            </p>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed">
              We&rsquo;re always looking for sharp people in sales, marketing, customer success,
              technology, operations, and finance. Tell us about yourself below — even if no
              role is listed today, we&rsquo;ll keep you in mind when one opens up.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-10">
            <div className="glass-strong rounded-3xl p-6 sm:p-8 lg:p-10">
              <h2 className="font-heading uppercase text-2xl tracking-tight">Apply now</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Two minutes, no cover letter required. Just attach your CV.
              </p>
              <div className="mt-6">
                <CareersForm />
              </div>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
