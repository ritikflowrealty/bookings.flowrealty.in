import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { CitiesBar } from '@/components/CitiesBar';
import { ProjectsSection } from '@/components/ProjectsSection';
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
        <ProjectsSection projects={projects} />
        <WhyChooseUs />
        <AboutContact />
      </main>
      <Footer />
    </>
  );
}
