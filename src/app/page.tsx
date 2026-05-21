import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { StatsCounter } from '@/components/StatsCounter';
import { ServicesSection } from '@/components/ServicesSection';
import { RegisterInterest } from '@/components/RegisterInterest';
import { CaseStudiesPreview } from '@/components/CaseStudiesPreview';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { PartnersSection } from '@/components/PartnersSection';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import { FounderCreds } from '@/components/FounderCreds';
import { SectionReveal } from '@/components/SectionReveal';
import { getSettings, setting } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const s = await getSettings();

  const stats = [
    { value: Number(setting(s, 'total_sales_value', '4500')), suffix: ' Cr', label: `In ${setting(s, 'years_active', '5')} years` },
    { value: 40, suffix: '+', label: 'Projects turnaround' },
    { value: Number(setting(s, 'team_size', '80')), suffix: '+', label: 'Member team' },
    { value: Number(setting(s, 'potential_inventory', '500')), suffix: ' Cr', label: 'Potential inventory next 12 months' },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Full-viewport video hero — no overlay, buttons at bottom */}
        <Hero />

        {/* 2. Horizontal scroll — Founders / Services / Case Studies / Life at Flow */}
        <HorizontalScroll />

        {/* 3. Dynamic banner section */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionReveal>
              <div className="max-w-4xl">
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
                  Real estate&rsquo;s #1 challenge is cashflow.
                </h2>
                <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-3xl">
                  Banks won&rsquo;t lend without sales. Buyers won&rsquo;t buy without confidence.
                  We break that cycle. From cashflow stress to sold-out projects — Flow Realty is
                  India&rsquo;s leading sales and marketing outsourcing partner.
                </p>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* 4. Stats counter with scroll animation */}
        <StatsCounter stats={stats} />

        {/* 5. Founder credentials */}
        <FounderCreds />

        {/* 6. Our Services (verticals) */}
        <ServicesSection />

        {/* 7. Our Partners */}
        <PartnersSection />

        {/* 8. Case studies preview — "See How We Did It" */}
        <CaseStudiesPreview />

        {/* 9. Testimonials */}
        <TestimonialsSection />

        {/* 10. Register interest (CP / Developer / Buyer) */}
        <RegisterInterest />

        {/* 11. CTA — Careers */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionReveal>
              <div className="glass-strong rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl"
                  style={{ background: 'radial-gradient(closest-side, rgba(123,46,255,0.6), transparent 70%)' }}
                />
                <span className="chip">Join the Flow</span>
                <h2 className="mt-4 font-heading text-3xl sm:text-4xl tracking-tight">
                  We&rsquo;re building the future of real estate sales.
                </h2>
                <p className="mt-3 text-ink-muted max-w-xl mx-auto">
                  Sharp people in sales, marketing, tech, and operations. If you want to be part of
                  the team that powers India&rsquo;s biggest real estate sales engine — let&rsquo;s talk.
                </p>
                <a href="/careers" className="btn-neon mt-8 inline-flex">
                  View open roles
                </a>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
