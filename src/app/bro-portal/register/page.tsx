import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { CPRegistrationForm } from './CPRegistrationForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Register as a Channel Partner | Flow Realty Bro Portal',
  description:
    'Register as a Flow Realty channel partner. Upload your RERA, Aadhaar, PAN. Once approved, start submitting leads against any project on the platform.',
};

export default function RegisterCPPage() {
  return (
    <>
      <Navbar />
      <main className="pt-8 pb-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Bro Portal · Register</span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
              Register as a Channel Partner.
            </h1>
            <p className="mt-3 text-ink-muted leading-relaxed">
              Fill in your details and upload your KYC documents. Our team reviews registrations
              within 24 hours and emails you the next steps.
            </p>
          </SectionReveal>
          <SectionReveal className="mt-10">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <CPRegistrationForm />
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
