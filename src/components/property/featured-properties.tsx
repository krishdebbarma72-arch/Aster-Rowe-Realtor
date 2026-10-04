import Link from "next/link";
import { getFeaturedProperties } from "@/lib/featured-properties";
import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { PropertyCard } from "./property-card";

export function FeaturedProperties() {
  const featured = getFeaturedProperties();
  if (!featured.length) return null;

  return <section className="featured-properties" aria-labelledby="featured-title">
    <Container>
      <div className="featured-introduction">
        <SectionHeading id="featured-title" as="h2" eyebrow="SELECTED HOMES" title="Find a place to make your own.">
          <p>Take a closer look at the spaces, features, and details of each home.</p>
        </SectionHeading>
        <Link href="/properties" className="text-link featured-action">View all properties</Link>
      </div>
      <div className="property-grid featured-grid">
        {featured.map((property) => <PropertyCard key={property.id} property={property} headingLevel="h3" />)}
      </div>
    </Container>
  </section>;
}
