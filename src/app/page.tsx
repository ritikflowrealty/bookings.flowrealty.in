import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { StatsCounter } from '@/components/StatsCounter';
import { ServicesSection } from '@/components/ServicesSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { RegisterInterest } from '@/components/RegisterInterest';
import { CaseStudiesPreview } from '@/components/CaseStudiesPreview';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { AboutContact } from '@/components/AboutContact';
import { SectionReveal } from '@/components/SectionReveal';
import { listVisibleProjects } from '@/lib/projects';
import { getSettings, setting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const [projects, s] = await Promise.all([listVisibleProjects(), getSettings()]);

  const stats = [
    { value: Number(setting(s, 'total_sales_value', '4500')), suffix: ' Cr', label: `Residential sales in ${setting(s, 'years_active', '5')} years` },
    { value: 40, suffix: '+', label: 'Project turnarounds' },
    { value: Number(setting(s, 'team_size', '80')), suffix: '+', label: 'Member team' },
    { value: Number(setting(s, 'cp_distribution_size', '1000')), suffix: '+', label: 'Channel partners' },
    { value: Number(setting(s, 'developers_count', '15')), suffix: '+', label: 'Developer partners' },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Full-viewport video / building hero */}
        <Hero />

        {/* 2. About Flow + animated stats */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionReveal>
              <div className="max-w-3xl">
                <p className="text-lg sm:text-xl text-ink-muted leading-relaxed">
                  Real estate&rsquo;s #1 challenge is cashflow. Banks won&rsquo;t lend without sales.
                  Buyers won&rsquo;t buy without confidence. We break that cycle. From cashflow stress
                  to sold-out projects, Flow Realty is India&rsquo;s leading sales and marketing
                  outsourcing partner for residential real estate.
                </p>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* 3. Stats counter band */}
        <StatsCounter stats={stats} />

        {/* 4. Services */}
        <ServicesSection />

        {/* 5. Projects */}
        <ProjectsSection projects={projects} />

        {/* 6. Register interest (CP / Developer / Buyer) */}
        <RegisterInterest />

        {/* 7. Case studies preview */}
        <CaseStudiesPreview />

        {/* 8. Why choose us */}
        <WhyChooseUs />

        {/* 9. Testimonials */}
        <TestimonialsSection />

        {/* 10. Contact */}
        <AboutContact />
      </main>
      <Footer />
    </>
  );
}
