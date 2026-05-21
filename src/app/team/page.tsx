import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { TeamMemberCard } from '@/components/TeamMemberCard';
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

export default async function TeamPage() {
  await ensureSchema();
  const db = getDb();
  const r = await db.execute(`
    SELECT id, name, designation, category, photo_url, bio, linkedin_url
    FROM team_members WHERE is_published = 1
    ORDER BY display_order, name
  `);
  const members = r.rows as unknown as Member[];

  const cofounders = members.filter((m) => m.category === 'cofounder');
  const leadership = members.filter((m) => m.category === 'leadership');
  const team = members.filter((m) => m.category === 'team' || (!cofounders.includes(m) && !leadership.includes(m)));

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Team Flow</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              The minds behind the moves.
            </h1>
            <p className="mt-4 max-w-2xl text-ink-muted leading-relaxed">
              Flow Realty is run by an 80-strong team from Tier-A brands and B-schools. Co-founders,
              leadership and a network that knows India&rsquo;s real estate inside out.
            </p>
          </SectionReveal>

          {cofounders.length > 0 && (
            <SectionReveal className="mt-16">
              <h2 className="font-heading text-3xl tracking-tight">Co-founders</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cofounders.map((m) => <TeamMemberCard key={m.id} member={m} />)}
              </div>
            </SectionReveal>
          )}

          {leadership.length > 0 && (
            <SectionReveal className="mt-16">
              <h2 className="font-heading text-3xl tracking-tight">Leadership</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadership.map((m) => <TeamMemberCard key={m.id} member={m} />)}
              </div>
            </SectionReveal>
          )}

          {team.length > 0 && (
            <SectionReveal className="mt-16">
              <h2 className="font-heading text-3xl tracking-tight">The team</h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {team.map((m) => <TeamMemberCard key={m.id} member={m} compact />)}
              </div>
            </SectionReveal>
          )}

          {members.length === 0 && (
            <div className="mt-16 glass rounded-3xl p-12 text-center">
              <p className="text-ink-muted">Team profiles coming soon. Add them from the admin panel.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
