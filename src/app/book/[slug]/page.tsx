import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingForm } from './BookingForm';
import { getProjectBySlug, toPublicProject } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = getProjectBySlug(slug);
  // 404 even with direct link if project is hidden or booking is closed
  if (!row || !row.is_visible || !row.booking_enabled) notFound();

  const project = toPublicProject(row);

  return (
    <>
      <Navbar />
      <main className="relative">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-20">
          <a href="/" className="text-sm text-ink-muted hover:text-ink inline-flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to homes
          </a>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <aside className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl glass-strong">
                {project.image_url ? (
                  <Image
                    src={project.image_url}
                    alt={project.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-neon-purple/30 via-neon-magenta/20 to-neon-orange/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    {project.developer} · {project.city}
                  </p>
                  <h1 className="mt-1 font-display text-3xl sm:text-4xl">{project.name}</h1>
                </div>
              </div>
              {project.description && (
                <p className="mt-5 text-sm text-ink-muted leading-relaxed">{project.description}</p>
              )}
              <ul className="mt-6 space-y-2 text-sm text-ink-muted">
                <li>• Provisional booking through Razorpay</li>
                <li>• Sales team reviews and confirms within 24 hours</li>
                <li>• No card data stored on this site</li>
              </ul>
            </aside>

            <section className="lg:col-span-7">
              <div className="glass rounded-3xl p-6 sm:p-8">
                <h2 className="font-display text-2xl">Provisional booking</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Enter your details. Final confirmation will come from our sales team after review.
                </p>
                <div className="mt-6">
                  <BookingForm project={project} paymentEnabled={!!row.payment_enabled} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
