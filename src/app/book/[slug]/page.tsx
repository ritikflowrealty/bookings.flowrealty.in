import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingForm } from './BookingForm';
import { getProjectBySlug, toPublicProject } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getProjectBySlug(slug);
  if (!row || !row.is_visible || !row.booking_enabled) notFound();

  const project = toPublicProject(row);

  const trustPoints = [
    project.trust_point_1,
    project.trust_point_2,
    project.trust_point_3,
  ].filter(Boolean);

  // Default trust points if admin hasn't set any
  const displayTrustPoints =
    trustPoints.length > 0
      ? trustPoints
      : [
          `Reserve through verified ${project.payment_provider === 'cashfree' ? 'Cashfree' : 'Razorpay'} checkout`,
          'Sales team reaches out within 24 hours',
          'Site visit, paperwork, and possession handled end-to-end',
        ];

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

              {/* Action buttons */}
              {(project.brochure_url || project.learn_more_url) && (
                <div className="mt-5 flex flex-col sm:flex-row items-start gap-3">
                  {project.brochure_url && (
                    <a
                      href={project.brochure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-sm inline-flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Download Brochure
                    </a>
                  )}
                  {project.learn_more_url && (
                    <a
                      href={project.learn_more_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-sm inline-flex items-center gap-2"
                    >
                      Learn More
                    </a>
                  )}
                </div>
              )}

              {/* Trust points */}
              <ul className="mt-6 space-y-2 text-sm text-ink-muted">
                {displayTrustPoints.map((point, i) => (
                  <li key={i}>• {point}</li>
                ))}
              </ul>
            </aside>

            <section className="lg:col-span-7">
              <div className="glass rounded-3xl p-6 sm:p-8">
                <h2 className="font-display text-2xl">Reserve this home</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  A few quick details and your unit is held for you. Our team confirms within 24 hours.
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
