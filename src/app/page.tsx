import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { StatsCounter } from '@/components/StatsCounter';
import { WhyFlowSection } from '@/components/WhyFlowSection';
import { ServicesSection } from '@/components/ServicesSection';
import { CaseStudiesPreview } from '@/components/CaseStudiesPreview';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { PartnersSection } from '@/components/PartnersSection';
import { FounderCreds } from '@/components/FounderCreds';
import { AwardsHomeStrip } from '@/components/AwardsHomeStrip';
import { StoryHeadline } from '@/components/StoryHeadline';
import { EnquireBlock } from '@/components/EnquireBlock';
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

  return (
    <>
      <Navbar />
      <main className="pb-12">
        {/* 1. Full-viewport video hero */}
        <Hero />

        {/* 2. Story headline with strike-through animation */}
        <section className="py-8 lg:py-12 relative overflow-hidden">
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
        <WhyFlowSection />

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

        {/* 11. Enquire Now (Developer / CP / Buyer) */}
        <section id="enquire" className="py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5">
                  <span className="chip">Enquire Now</span>
                  <h2 className="mt-3 font-heading uppercase text-3xl sm:text-4xl tracking-tight leading-[1.05]">
                    Tell us who you are. We&rsquo;ll take it from there.
                  </h2>
                  <p className="mt-4 text-ink leading-relaxed">
                    Whether you&rsquo;re a developer with a project to launch, a channel partner
                    bringing a buyer, or a home buyer hunting for the right address, the right
                    person at Flow gets back to you within two hours.
                  </p>
                </div>
                <div className="lg:col-span-7 glass-strong rounded-3xl p-6 sm:p-8 lg:p-10">
                  <EnquireBlock initial="developer" />
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
