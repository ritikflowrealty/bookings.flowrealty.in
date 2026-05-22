import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { EnquireBlock } from '@/components/EnquireBlock';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Enquire Now | Speak to a Flow Realty Advisor',
  description:
    'Whether you are a developer, channel partner, or home buyer, our team responds within 2 hours.',
};

type Audience = 'developer' | 'cp' | 'buyer';

export default async function EnquirePage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const sp = await searchParams;
  const initial: Audience = sp.as === 'developer' || sp.as === 'cp' ? sp.as : 'buyer';

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <SectionReveal>
            <span className="chip">Enquire Now</span>
            <h1 className="mt-4 font-heading uppercase text-4xl sm:text-5xl tracking-tight">
              Tell us who you are.{' '}
              <span className="neon-text">We&rsquo;ll take it from there.</span>
            </h1>
            <p className="mt-4 text-ink leading-relaxed max-w-2xl">
              Whether you&rsquo;re a developer with a project to launch, a channel partner bringing
              a buyer, or a home buyer hunting for the right address, the right person at Flow gets
              back to you within two hours.
            </p>
          </SectionReveal>

          <SectionReveal className="mt-10">
            <div className="glass-strong rounded-3xl p-6 sm:p-8">
              <EnquireBlock initial={initial} />
            </div>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
