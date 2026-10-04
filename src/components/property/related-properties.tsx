import { getRelatedProperties } from "@/lib/property-details";
import type { Property } from "@/lib/properties";
import { PropertyCard } from "./property-card";

export function RelatedProperties({ property }: { property: Property }) {
  const related = getRelatedProperties(property);
  if (!related.length) return null;
  return <section className="related-properties" aria-labelledby="related-properties-title">
    <h2 id="related-properties-title">Other homes to explore</h2>
    <div className="property-grid">{related.map((record) => <PropertyCard key={record.id} property={record} headingLevel="h3" />)}</div>
  </section>;
}
