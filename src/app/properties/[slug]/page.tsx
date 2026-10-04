import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PropertyFacts } from "@/components/property/property-facts";
import { AvailabilityBadge } from "@/components/property/availability-badge";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyFloorPlan } from "@/components/property/property-floor-plan";
import { PropertyInquiry } from "@/components/property/property-inquiry";
import { RelatedProperties } from "@/components/property/related-properties";
import { getPropertyDetails, getPropertyGalleryImages } from "@/lib/property-details";
import { properties, getPropertyBySlug, formatPrice } from "@/lib/properties";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return properties.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = getPropertyBySlug((await params).slug);
  if (!property) return { title: "Property not found" };
  return { title: `${property.title} in ${property.area}`, description: `${property.title} in ${property.area}. ${formatPrice(property.priceGBP)} · ${property.bedrooms} ${property.bedrooms === 1 ? "bedroom" : "bedrooms"} · ${property.propertyType.toLowerCase()}. Illustrative demonstration listing for the fictional Aster & Rowe agency.` };
}

export default async function PropertyPage({ params }: Props) {
  const property = getPropertyBySlug((await params).slug);
  if (!property) notFound();
  return <Container className="page-section property-detail">
    <nav className="property-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        <li><span aria-hidden="true">/</span><Link href="/properties">Properties</Link></li>
        <li><span aria-hidden="true">/</span><span aria-current="page">{property.title}</span></li>
      </ol>
    </nav>
    <div className="property-detail-heading">
      <div><AvailabilityBadge status={property.availability} /><h1 className="page-title">{property.title}</h1><p className="property-detail-location">{property.displayLocation}</p></div>
      <p className="property-detail-price">{formatPrice(property.priceGBP)}</p>
    </div>
    <PropertyFacts property={property} detailed />
    <PropertyGallery key={property.id} images={getPropertyGalleryImages(property.media)} />
    <div className="property-body-layout">
      <div className="property-information">
        <section aria-labelledby="property-about-title">
          <h2 id="property-about-title">About this home</h2>
          <p>{property.description}</p>
          <p className="listing-disclosure">Illustrative listing for a fictional agency.</p>
        </section>
        <section aria-labelledby="property-features-title">
          <h2 id="property-features-title">Key features</h2>
          <ul className="property-key-features">{property.keyFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        </section>
        <section aria-labelledby="property-details-title">
          <h2 id="property-details-title">Property details</h2>
          <dl className="property-details-list">{getPropertyDetails(property).map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </section>
        <PropertyFloorPlan asset={property.media.floorPlan} />
      </div>
      <PropertyInquiry property={property} />
    </div>
    <RelatedProperties property={property} />
  </Container>;
}
