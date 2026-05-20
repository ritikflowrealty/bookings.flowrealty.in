import { ProjectTile } from './ProjectTile';
import { toPublicProject } from '@/lib/projects';
import type { ProjectRow } from '@/lib/db';
import { SectionReveal } from './SectionReveal';

export function ProjectGrid({
  rows,
  emptyMessage = 'No projects available right now. Tell us what you\'re looking for and we\'ll get back to you within 2 hours.',
  heading,
}: {
  rows: ProjectRow[];
  emptyMessage?: string;
  heading?: string;
}) {
  if (!rows.length) {
    return (
      <SectionReveal className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
        {heading && <h2 className="font-display text-3xl sm:text-4xl tracking-tight">{heading}</h2>}
        <div className="mt-6 glass rounded-3xl p-12 text-center">
          <p className="text-ink-muted">{emptyMessage}</p>
          <a href="/enquire" className="btn-neon mt-6 inline-flex">Enquire Now</a>
        </div>
      </SectionReveal>
    );
  }

  const projects = rows.map(toPublicProject);

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
      <SectionReveal>
        {heading && <h2 className="font-display text-3xl sm:text-4xl tracking-tight">{heading}</h2>}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
          {projects.map((p, i) => (
            <ProjectTile key={p.id} project={p} index={i} />
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}
