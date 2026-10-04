import { formatArea, type Property } from "@/lib/properties";

export function PropertyFacts({ property, detailed = false }:
  { property: Partial<Pick<Property, "bedrooms" | "bathrooms" | "interiorSqFt" | "propertyType">>; detailed?: boolean }) {
  const hasBedrooms = typeof property.bedrooms === "number" && Number.isFinite(property.bedrooms);
  const hasBathrooms = typeof property.bathrooms === "number" && Number.isFinite(property.bathrooms);
  const hasArea = typeof property.interiorSqFt === "number" && Number.isFinite(property.interiorSqFt);
  if (!hasBedrooms && !hasBathrooms && !hasArea && !(detailed && property.propertyType)) return null;
  return <dl className={`property-facts ${detailed ? "property-facts--detailed" : ""}`}>
    {hasBedrooms && <div><dt>{property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}</dt><dd>{property.bedrooms}<span className="compact-fact-label"> {property.bedrooms === 1 ? "bedroom" : "bedrooms"}</span></dd></div>}
    {hasBathrooms && <div><dt>{property.bathrooms === 1 ? "Bathroom" : "Bathrooms"}</dt><dd>{property.bathrooms}<span className="compact-fact-label"> {property.bathrooms === 1 ? "bathroom" : "bathrooms"}</span></dd></div>}
    {hasArea && property.interiorSqFt !== undefined && <div><dt>Interior area</dt><dd>{formatArea(property.interiorSqFt)}</dd></div>}
    {detailed && property.propertyType && <div><dt>Property type</dt><dd>{property.propertyType}</dd></div>}
  </dl>;
}
