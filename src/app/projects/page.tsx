import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProjectsSection } from '@/components/ProjectsSection';
import { listVisibleProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'Projects in Bangalore, Mysore & Bhubaneswar | Flow Realty',
  description:
    'Browse verified residential projects across Bangalore, Mysore and Bhubaneswar. Filter by city, configuration and budget. Reserve online with Flow Realty.',
};

export default async function ProjectsIndex() {
  const projects = await listVisibleProjects();
  return (
    <>
      <Navbar />
      <main className="pt-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="chip">Projects</span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">
              Curated homes across India.
            </h1>
            <p className="mt-3 text-ink-muted">
              Every project below is one our team has walked, priced, and approved before you ever
              see it.
            </p>
          </div>
        </div>
        <ProjectsSection projects={projects} />
      </main>
      <Footer />
    </>
  );
}
