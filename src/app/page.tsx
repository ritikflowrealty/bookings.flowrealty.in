import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { CitiesBar } from '@/components/CitiesBar';
import { ProjectTile } from '@/components/ProjectTile';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { AboutContact } from '@/components/AboutContact';
import { listVisibleProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const projects = await listVisibleProjects();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CitiesBar />

        <section id="projects" className="relative py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div className="max-w-xl">
                <span className="chip">Live Projects</span>
                <h2 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
                  Floating tiles, real homes.
                </h2>
                <p className="mt-3 text-ink-muted">
                  Tap any project to view details and start a provisional booking. Hover the tiles
                  for a closer look.
                </p>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="mt-12 glass rounded-3xl p-12 text-center">
                <p className="text-ink-muted">
                  No projects are live right now. Please check back shortly.
                </p>
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {projects.map((p, i) => (
                  <ProjectTile key={p.id} project={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        <WhyChooseUs />
        <AboutContact />
      </main>
      <Footer />
    </>
  );
}
