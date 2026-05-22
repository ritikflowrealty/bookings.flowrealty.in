import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { StatsCounter } from '@/components/StatsCounter';
import { WhyFlowOrbit } from '@/components/WhyFlowOrbit';
import { ServicesSection } from '@/components/ServicesSection';
import { CaseStudiesPreview } from '@/components/CaseStudiesPreview';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { PartnersSection } from '@/components/PartnersSection';
import { FounderCreds } from '@/components/FounderCreds';
import { AwardsHomeStrip } from '@/components/AwardsHomeStrip';
import { StoryHeadline } from '@/components/StoryHeadline';
import { SectionReveal } from '@/components/SectionReveal';
import { getSettings, setting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const s = await getSettings();

  const salesValue = Number(setting(s, 'total_sales_value', '3500'));
  const salesUnit = setting(s, 'total_sales_unit', 'Cr');
  const years = setting(s, 'years_active', '5');
  const projectsTurnaround = Number(setting(s, 'projects_count', '40'));
  const teamSize = Number(setting(s, 'team_size', '80'));
  const cpSize = Number(setting(s, 'cp_distribution_size', '1000'));
  const developersCount = Number(setting(s, 'developers_count', '15'));

  const stats = [
    { value: salesValue, suffix: ` ${salesUnit}`, label: `In ${years} years` },
    { value: projectsTurnaround, suffix: '+', label: 'Projects turnaround' },
    { value: teamSize, suffix: '+', label: 'Member team' },
    { value: cpSize, suffix: '+', label: 'CP network' },
    { value: developersCount, suffix: '+', label: 'Developer partners' },
  ];

  const aboutParagraph = setting(
    s,
    'about_paragraph',
    'Banks won\u2019t lend without sales. Buyers won\u2019t buy without confidence. We break that cycle. From cashflow stress to sold-out projects, Flow Realty is India\u2019s leading sales and marketing outsourcing partner.'
  );
  const careersHeadline = setting(s, 'careers_headline', 'We\u2019re building the future of real estate sales.');
  const careersSubline = setting(
    s,
    'careers_subline',
    'Sharp people in sales, marketing, tech, and operations. If you want to be part of the team that powers India\u2019s biggest real estate sales engine, let\u2019s talk.'
  );

  return (
    <>
      <Navbar />
      <main className="pb-12">
        {/* 1. Full-viewport video hero */}
        <Hero />

        {/* 2. Story headline with strike-through animation */}
        <section className="py-14 lg:py-20 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <StoryHeadline
              prefix="REAL ESTATE'S #1 CHALLENGE IS"
              decoy="SALES"
              reveal="CASHFLOW."
              paragraph={aboutParagraph}
            />
          </div>
        </section>

        {/* 3. Stats counter */}
        <StatsCounter stats={stats} />

        {/* 4. Founders — 3D cutout stage */}
        <FounderCreds />

        {/* 5. Why Flow? — horizontal slide tiles */}
        <WhyFlowOrbit />

        {/* 6. Our Services — magazine-style numbered list with sticky preview */}
        <ServicesSection />

        {/* 7. Awards */}
        <AwardsHomeStrip />

        {/* 8. Partners (developers + banking) */}
        <PartnersSection />

        {/* 9. Case studies */}
        <CaseStudiesPreview />

        {/* 10. Testimonials */}
        <TestimonialsSection />

        {/* 11. Careers CTA */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionReveal>
              <div className="glass-strong rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl"
                  style={{ background: 'radial-gradient(closest-side, rgba(123,46,255,0.6), transparent 70%)' }}
                />
                <div className="relative max-w-3xl">
                  <span className="chip">Join the Flow</span>
                  <h2 className="mt-4 font-heading uppercase text-3xl sm:text-4xl tracking-tight">
                    {careersHeadline}
                  </h2>
                  <p className="mt-3 text-ink-muted">{careersSubline}</p>
                  <a href="/careers" className="btn-neon mt-8 inline-flex">
                    View open roles
                  </a>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
