import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Property } from "@/lib/properties";
import { Arrow } from "../ui/button";
import { AvailabilityBadge } from "./availability-badge";
import { PropertyFacts } from "./property-facts";

export function PropertyCard({ property, headingLevel: Heading = "h2" }: { property: Property; headingLevel?: "h2" | "h3" }) {
  const image = property.media.mainImage;
  const hasImage = Boolean(image?.src.trim());
  return <article className="property-card">
    <Link href={`/properties/${property.slug}`} className="property-card-link" aria-label={`View ${property.title.toLowerCase()} in ${property.area} — ${formatPrice(property.priceGBP)}, ${property.availability.toLowerCase()}`}
      aria-describedby={`property-${property.id}-facts`}>
      <div className="property-card-image" aria-hidden={!hasImage || undefined}>
        {hasImage && image && <Image src={image.src} alt={image.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />}
      </div>
      <div className="property-card-info">
        <div className="property-card-availability"><AvailabilityBadge status={property.availability} /></div>
        <p className="property-price">{formatPrice(property.priceGBP)}</p>
        <Heading className="property-card-title">{property.title}</Heading>
        <p className="property-location">{property.area}</p>
        <div id={`property-${property.id}-facts`}><PropertyFacts property={property} /></div>
        <div className="property-card-bottom"><span>View property</span><Arrow /></div>
      </div>
    </Link>
  </article>;
}
