import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { ensureSchema, getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Life at Flow | Culture, Team & Behind the Scenes',
  description: 'Meet the 80+ member team behind Flow Realty. Team testimonials, behind the scenes, and what makes working at Flow different.',
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

export default async function LifeAtFlowPage() {
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

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Life at Flow</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              The people behind the numbers.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
              80+ professionals from Tier-A brands and B-schools. One mission: make real estate
              sales predictable, profitable, and stress-free for developers.
            </p>
          </SectionReveal>

          {/* Team testimonials section */}
          <SectionReveal className="mt-16">
            <h2 className="font-heading text-3xl tracking-tight">What the team says</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TestimonialCard
                quote="Flow gave me the platform to work on real problems — not just push listings, but actually solve cashflow challenges for developers."
                name="Sales Lead"
                role="3 years at Flow"
              />
              <TestimonialCard
                quote="The energy here is different. Everyone owns their number. There's no hiding behind process — you either deliver or you learn fast."
                name="Marketing Manager"
                role="2 years at Flow"
              />
              <TestimonialCard
                quote="Coming from a Tier-A developer, I thought I knew sales. Flow taught me velocity. The pace here is unmatched."
                name="Senior Associate"
                role="1.5 years at Flow"
              />
            </div>
          </SectionReveal>

          {/* Behind the scenes */}
          <SectionReveal className="mt-20">
            <h2 className="font-heading text-3xl tracking-tight">Behind the scenes</h2>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
              ].map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Life at Flow ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </SectionReveal>

          {/* Leadership */}
          {(cofounders.length > 0 || leadership.length > 0) && (
            <SectionReveal className="mt-20">
              <h2 className="font-heading text-3xl tracking-tight">Leadership</h2>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...cofounders, ...leadership].map((m) => (
                  <TeamMemberCard key={m.id} member={m} />
                ))}
              </div>
            </SectionReveal>
          )}

          {/* CTA */}
          <SectionReveal className="mt-20">
            <div className="glass-strong rounded-3xl p-10 md:p-14 text-center">
              <h2 className="font-heading text-3xl tracking-tight">Want to join the Flow?</h2>
              <p className="mt-3 text-ink-muted max-w-lg mx-auto">
                We&rsquo;re always looking for sharp people in sales, marketing, tech, and operations.
              </p>
              <a href="/careers" className="btn-neon mt-6 inline-flex">
                View open roles
              </a>
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col">
      <p className="text-sm text-ink-muted leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-[11px] text-ink-dim">{role}</p>
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: Member }) {
  return (
    <article className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.03]">
        {member.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-neon-orange/20 flex items-center justify-center">
            <span className="font-display text-3xl text-ink-dim">
              {member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-display text-lg leading-tight">{member.name}</h3>
        <p className="mt-0.5 text-xs text-ink-muted">{member.designation}</p>
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-ink-dim hover:text-ink transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
        )}
      </div>
    </article>
  );
}
