import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PropertyCard } from "@/components/property/property-card";
import { PropertySearch } from "@/components/property/property-search";
import { filterProperties, parsePropertyFilters, parsePropertySort, sortProperties, getActivePropertyFilters, getPropertySearchHref, type QueryParameters } from "@/lib/property-search";

export const metadata: Metadata = {
  title: "Properties for sale",
  description: "Browse six illustrative London sale listings, with homes in a range of areas, sizes and price points. Demonstration listings from a fictional agency.",
};

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<QueryParameters> }) {
  const query = await searchParams;
  const filters = parsePropertyFilters(query);
  const sort = parsePropertySort(query);
  const results = sortProperties(filterProperties(filters), sort);
  const active = getActivePropertyFilters(filters);
  return <Container className="page-section listings-page">
    <SectionHeading eyebrow="HOMES IN LONDON" title="Properties for sale" />
    <PropertySearch key={JSON.stringify(query)} mode="listings" filters={filters} sort={sort} />
    <div className="results-toolbar">
      <div><p className="result-count" aria-live="polite">{results.length} {results.length === 1 ? "property" : "properties"}</p>
        {active.length ? <ul className="active-filter-list" aria-label="Active filters">
          {active.map(({ name, label }) => <li key={name}><Link className="filter-chip" href={getPropertySearchHref(filters, sort, name)} aria-label={`Remove ${label} filter`}>
            <span>{label}</span><span aria-hidden="true">×</span>
          </Link></li>)}
        </ul> : <p className="filter-summary">All London · Any type · Any price · Any bedrooms</p>}</div>
      <Link href="/properties" className="text-link">Clear filters</Link>
    </div>
    {results.length ? <div className="property-grid">{results.map((property) => <PropertyCard key={property.id} property={property} />)}</div> :
      <div className="empty-results"><h2>No homes match these filters.</h2><p>Try a higher budget, fewer bedrooms, or a wider search.</p><ButtonLink href="/properties">View all properties</ButtonLink></div>}
  </Container>;
}
