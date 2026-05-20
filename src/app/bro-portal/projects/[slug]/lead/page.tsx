import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SectionReveal } from '@/components/SectionReveal';
import { getSession, PORTAL_COOKIE } from '@/lib/portal-auth';
import { getProjectBySlug, toPublicProject } from '@/lib/projects';
import { LeadForm } from './LeadForm';

export const dynamic = 'force-dynamic';

export default async function CPLeadPage({ params }: { params: Promise<{ slug: string }> }) {
  const store = await cookies();
  const session = await getSession(store.get(PORTAL_COOKIE.cp)?.value);
  if (!session || session.portal !== 'cp') {
    const { slug } = await params;
    redirect(`/bro-portal/login?next=/bro-portal/projects/${slug}/lead`);
  }
  const { slug } = await params;
  const row = await getProjectBySlug(slug);
  if (!row || !row.is_visible) notFound();
  const project = toPublicProject(row);

  return (
    <>
      <Navbar />
      <main className="pt-10 pb-24">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <SectionReveal>
            <p className="text-xs text-ink-muted">
              <a href="/bro-portal/dashboard" className="hover:text-ink">← Back to dashboard</a>
            </p>
            <h1 className="mt-3 font-display text-3xl tracking-tight">
              Register a lead for {project.name}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">{project.developer} · {project.city}</p>
          </SectionReveal>

          <SectionReveal className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-strong">
                {project.image_url && (
                  <Image
                    src={project.image_url}
                    alt={project.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-4 text-sm text-ink-muted leading-relaxed">{project.description}</p>
            </aside>

            <section className="lg:col-span-8">
              <div className="glass rounded-3xl p-6 sm:p-8">
                <LeadForm projectId={project.id} projectSlug={project.slug} />
              </div>
            </section>
          </SectionReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
