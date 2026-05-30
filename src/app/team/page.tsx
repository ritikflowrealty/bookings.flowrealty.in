import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import { FounderCreds } from '@/components/FounderCreds';
import { JoinFlowCta } from '@/components/JoinFlowCta';
import { ensureSchema, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Team Flow | Leadership & Co-founders | Flow Realty',
  description:
    'Meet the leadership team behind Flow Realty. 80+ professionals from Tier-A brands and B-schools driving real estate sales for India\'s top developers.',
};

type Member = {
  id: number;
  name: string;
  designation: string;
  category: string;
  photo_url: string;
  bio: string;
  linkedin_url: string;
};

function normalizeCategory(c: string | null | undefined): 'cofounder' | 'leadership' | 'team' {
  const v = (c || '').toString().toLowerCase().trim();
  if (v === 'cofounder' || v === 'co-founder' || v === 'founder') return 'cofounder';
  if (v === 'leadership' || v === 'leader') return 'leadership';
  return 'team';
}

export default async function TeamPage() {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute(`
    SELECT id, name, designation, category, photo_url, bio, linkedin_url
    FROM team_members WHERE is_published = 1
    ORDER BY display_order, name
  `);
  const members = r.rows as unknown as Member[];

  const leadership = members.filter((m) => normalizeCategory(m.category) === 'leadership');
  const team = members.filter((m) => normalizeCategory(m.category) === 'team');

  return (
    <>
      <Navbar />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Team Flow</span>
            <h1 className="mt-4 font-heading uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              The minds behind the moves.
            </h1>
            <p className="mt-4 max-w-2xl text-ink leading-relaxed">
              Flow Realty is run by an 80-strong team from Tier-A brands and B-schools. Co-founders,
              leadership and a network that knows India&rsquo;s real estate inside out.
            </p>
          </SectionReveal>
        </div>

        {/* Co-founders — hide the duplicate Leadership chip on this page,
            since the page heading above already establishes context. */}
        <FounderCreds hideHeading />

        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {leadership.length > 0 && (
            <SectionReveal className="mt-12">
              <h2 className="font-heading uppercase text-2xl sm:text-3xl tracking-tight">
                Leadership
              </h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadership.map((m) => <TeamMemberCard key={m.id} member={m} />)}
              </div>
            </SectionReveal>
          )}

          {team.length > 0 && (
            <SectionReveal className="mt-12">
              <h2 className="font-heading uppercase text-2xl sm:text-3xl tracking-tight">
                The team
              </h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {team.map((m) => <TeamMemberCard key={m.id} member={m} compact />)}
              </div>
            </SectionReveal>
          )}
        </div>

        <JoinFlowCta />
      </main>
      <Footer />
    </>
  );
}
