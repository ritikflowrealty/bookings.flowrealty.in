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
  getLocationBySlug,
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

type RouteParams = { city: string; location: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  try {
    const { city: citySlug, location: locSlug } = await params;
    const city = SUPPORTED_CITIES[citySlug];
    if (!city) return {};
    const loc = await getLocationBySlug(locSlug);
    if (!loc || loc.city !== city) return {};
    return {
      title: loc.meta_title || `Apartments in ${loc.name}, ${city} | Flow Realty`,
      description:
        loc.meta_description ||
        `Browse residential projects in ${loc.name}, ${city}. Verified by Flow Realty.`,
      alternates: { canonical: `${SITE_URL}/${citySlug}/flats-in-${locSlug}/` },
    };
  } catch {
    return {};
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 600;

export default async function LocationPage({ params }: { params: Promise<RouteParams> }) {
  const { city: citySlug, location: locSlug } = await params;
  const city = SUPPORTED_CITIES[citySlug];
  if (!city) notFound();

  const loc = await getLocationBySlug(locSlug);
  if (!loc || loc.city !== city) notFound();

  // Defensive: each fetch is independent; if any fails, fall back to empty array
  // so the page still renders rather than throwing a 500.
  const [allLocations, configurations, budgets, rows] = await Promise.all([
    listLocations(city).catch(() => []),
    listConfigurations(city).catch(() => []),
    listBudgets(city).catch(() => []),
    listProjectsForFilter({ city, locationId: loc.id }).catch(() => [] as Record<string, unknown>[]),
  ]);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: city, href: `/${citySlug}/` },
    { label: loc.name },
  ];

  const otherLocationLinks = (allLocations || [])
    .filter((l) => l.slug !== loc.slug)
    .slice(0, 12)
    .map((l) => ({
      href: `/${citySlug}/flats-in-${l.slug}/`,
      label: `Flats in ${l.name}`,
    }));

  const configLinks = (configurations || []).map((c) => ({
    href: `/${citySlug}/${c.slug}/`,
    label: c.label,
  }));

  const budgetLinks = (budgets || []).map((b) => ({
    href: `/${citySlug}/${b.slug}/`,
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
          eyebrow={`${city} · ${loc.name}`}
          title={`Apartments in ${loc.name}.`}
          highlightWord={`${loc.name}.`}
          subtitle={loc.description || `Verified residential projects in ${loc.name}, ${city}.`}
          breadcrumbs={breadcrumbs}
        />

        <ProjectGrid
          rows={(rows || []) as unknown as ProjectRow[]}
          heading={`Projects in ${loc.name}`}
          emptyMessage={`No live projects in ${loc.name} right now. Tell us what you are looking for and we'll alert you when we list one.`}
        />

        {configLinks.length > 0 && (
          <RelatedLinks title={`${loc.name} by configuration`} items={configLinks} />
        )}
        {budgetLinks.length > 0 && (
          <RelatedLinks title={`${loc.name} by budget`} items={budgetLinks} />
        )}
        {otherLocationLinks.length > 0 && (
          <RelatedLinks title={`Other ${city} locations`} items={otherLocationLinks} />
        )}

        <InlineEnquireCard
          title={`Looking for a home in ${loc.name}?`}
          body="Share your budget and configuration. Our advisor will call back with options within 2 hours."
        />
      </main>
      <Footer />
    </>
  );
}
