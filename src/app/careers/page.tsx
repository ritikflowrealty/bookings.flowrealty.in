import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';
import { getSettings, setting } from '@/lib/settings';

export const metadata = {
  title: 'Careers at Flow Realty | Real Estate Sales Roles',
  description: 'Join the team that powers India\'s biggest real estate sales engine. Open roles in sales, marketing, technology and operations.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function CareersPage() {
  const s = await getSettings();
  const teamSize = setting(s, 'team_size', '75');
  const email = setting(s, 'contact_email', 'hello@flowrealty.in');

  return (
    <>
      <Navbar />
      <main className="pt-8 pb-12">
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
              Flow Realty is a {teamSize}-person team from Tier-A brands and B-schools. We work on
              the hardest sales problems in residential real estate: turning around stuck
              projects, launching new ones at velocity, and building the technology that runs
              underneath all of it.
            </p>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed">
              We&rsquo;re always looking for sharp people in sales, marketing, customer success,
              technology, operations, and finance. Drop us a note even if there&rsquo;s no role
              listed.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-10">
            <a href={`mailto:${email}?subject=Careers%20at%20Flow%20Realty`} className="btn-neon">
              Email us your CV
            </a>
          </SectionReveal>
        </div>
      </main>
      <InlineEnquireCard
        title="Hiring us instead?"
        body="If you're a developer looking for a sales partner, send us an enquiry."
      />
      <Footer />
    </>
  );
}
