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
  getConfigurationBySlug,
  getBudgetBySlug,
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

type RouteParams = { city: string; slug: string };

async function resolveSlug(citySlug: string, slug: string) {
  const city = SUPPORTED_CITIES[citySlug];
  if (!city) return null;
  const config = await getConfigurationBySlug(slug);
  if (config && config.city === city) return { kind: 'configuration' as const, city, config };
  const budget = await getBudgetBySlug(slug);
  if (budget && budget.city === city) return { kind: 'budget' as const, city, budget };
  return null;
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { city: citySlug, slug } = await params;
  const resolved = await resolveSlug(citySlug, slug);
  if (!resolved) return {};
  const meta =
    resolved.kind === 'configuration'
      ? { title: resolved.config.meta_title, desc: resolved.config.meta_description }
      : { title: resolved.budget.meta_title, desc: resolved.budget.meta_description };
  return {
    title: meta.title || `${slug} in ${resolved.city} | Flow Realty`,
    description: meta.desc || `Verified residential projects in ${resolved.city}.`,
    alternates: { canonical: `${SITE_URL}/${citySlug}/${slug}/` },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 600;

export default async function CityFilterPage({ params }: { params: Promise<RouteParams> }) {
  const { city: citySlug, slug } = await params;
  const resolved = await resolveSlug(citySlug, slug);
  if (!resolved) notFound();

  const { city } = resolved;
  let label = '';
  let description = '';
  let filter: { city: string; configurationId?: number; minPrice?: number; maxPrice?: number } = { city };

  if (resolved.kind === 'configuration') {
    label = resolved.config.label;
    description = resolved.config.description || `Curated ${label} in ${city}.`;
    filter.configurationId = resolved.config.id;
  } else {
    label = resolved.budget.label;
    description = `Verified residential projects in ${city} priced ${label.toLowerCase()}.`;
    filter.minPrice = resolved.budget.min_amount;
    filter.maxPrice = resolved.budget.max_amount;
  }

  const [allLocations, configurations, budgets, rows] = await Promise.all([
    listLocations(city),
    listConfigurations(city),
    listBudgets(city),
    listProjectsForFilter(filter),
  ]);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: city, href: `/${citySlug}/` },
    { label },
  ];

  const locationLinks = allLocations.slice(0, 12).map((l) => ({
    href: `/${citySlug}/flats-in-${l.slug}/`,
    label: `Flats in ${l.name}`,
  }));

  const configLinks =
    resolved.kind === 'configuration'
      ? []
      : configurations.map((c) => ({
          href: `/${citySlug}/${c.slug}/`,
          label: c.label,
        }));

  const budgetLinks =
    resolved.kind === 'budget'
      ? []
      : budgets.map((b) => ({
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
          eyebrow={`${city} · ${label}`}
          title={`${label} in ${city}.`}
          highlightWord={`${city}.`}
          subtitle={description}
          breadcrumbs={breadcrumbs}
        />

        <ProjectGrid
          rows={rows as unknown as ProjectRow[]}
          heading={`${label} available in ${city}`}
        />

        {locationLinks.length > 0 && (
          <RelatedLinks title={`${city} by location`} items={locationLinks} />
        )}
        {configLinks.length > 0 && (
          <RelatedLinks title="Browse by configuration" items={configLinks} />
        )}
        {budgetLinks.length > 0 && (
          <RelatedLinks title="Browse by budget" items={budgetLinks} />
        )}

        <InlineEnquireCard
          title={`Looking for ${label} in ${city}?`}
          body="Share your preferences. Our advisor will call back with curated options within 2 hours."
        />
      </main>
      <Footer />
    </>
  );
}
