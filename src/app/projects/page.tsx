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
        <ProjectsSection projects={projects} />
      </main>
      <Footer />
    </>
  );
}
