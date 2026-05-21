import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingHero } from '@/components/LandingHero';
import { ProjectGrid } from '@/components/ProjectGrid';
import { RelatedLinks } from '@/components/RelatedLinks';
import { InlineEnquireCard } from '@/components/InlineEnquireCard';
import { breadcrumbJsonLd } from '@/components/Breadcrumbs';
import {
  listLocations,
  listConfigurations,
  listBudgets,
  listProjectsForFilter,
} from '@/lib/taxonomy';
import type { ProjectRow } from '@/lib/db';

const SUPPORTED_CITIES: Record<string, string> = {
  bangalore: 'Bangalore',
  mysore: 'Mysore',
  bhubaneswar: 'Bhubaneswar',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booking.flowrealty.in';

type RouteParams = { city: string };

export async function generateStaticParams() {
  return Object.keys(SUPPORTED_CITIES).map((city) => ({ city }));
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = SUPPORTED_CITIES[slug];
  if (!city) return {};
  return {
    title: `Apartments, Villas & Plots in ${city} | Flow Realty`,
    description: `Verified residential projects in ${city} from RERA-registered developers. Compare 1, 2, 3 BHK flats, villas and plots across top localities.`,
    alternates: { canonical: `${SITE_URL}/${slug}/` },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 600;

export default async function CityHubPage({ params }: { params: Promise<RouteParams> }) {
  const { city: slug } = await params;
  const city = SUPPORTED_CITIES[slug];
  if (!city) notFound();

  const [locations, configurations, budgets, projectRows] = await Promise.all([
    listLocations(city).catch(() => []),
    listConfigurations(city).catch(() => []),
    listBudgets(city).catch(() => []),
    listProjectsForFilter({ city }).catch(() => [] as Record<string, unknown>[]),
  ]);
  const rows = (projectRows || []) as unknown as ProjectRow[];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: city },
  ];

  const locationLinks = locations.map((l) => ({
    href: `/${slug}/flats-in-${l.slug}/`,
    label: l.name,
    description: l.description.slice(0, 60),
  }));

  const configLinks = configurations.map((c) => ({
    href: `/${slug}/${c.slug}/`,
    label: c.label,
  }));

  const budgetLinks = budgets.map((b) => ({
    href: `/${slug}/${b.slug}/`,
    label: b.label,
  }));

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs, SITE_URL)),
        }}
      />
      <main className="pt-6">
        <LandingHero
          eyebrow={city}
          title={`Homes in ${city}.`}
          highlightWord={`${city}.`}
          subtitle={`Every project below has been walked, priced, and approved by Flow Realty's team. Filter by location, configuration or budget to find your home in ${city}.`}
          breadcrumbs={breadcrumbs}
        />

        <ProjectGrid
          rows={rows}
          heading={`Available projects in ${city}`}
        />

        {locationLinks.length > 0 && (
          <RelatedLinks title={`${city} by location`} items={locationLinks} />
        )}
        {configLinks.length > 0 && (
          <RelatedLinks title="By configuration" items={configLinks} />
        )}
        {budgetLinks.length > 0 && (
          <RelatedLinks title="By budget" items={budgetLinks} />
        )}

        <InlineEnquireCard />
      </main>
      <Footer />
    </>
  );
}
