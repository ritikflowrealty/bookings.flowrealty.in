import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { EnquireForm } from './EnquireForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Enquire Now | Speak to a Flow Realty Advisor',
  description:
    'Tell us what you\'re looking for. Our team will call you back within 2 hours with curated home options that match your budget, location and configuration.',
};

export default function EnquirePage() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Enquire Now</span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
              Tell us what home you want.
              <br />
              <span className="neon-text">We&rsquo;ll find it.</span>
            </h1>
            <p className="mt-4 text-ink-muted leading-relaxed">
              Our advisor calls within 2 hours, weekdays. Share what you&rsquo;re looking for and
              we&rsquo;ll bring you 3 options that match.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-10">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <EnquireForm />
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
