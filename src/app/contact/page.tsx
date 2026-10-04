import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { EnquiryForm } from "@/components/enquiry-form";
import { enquiryContent, getToday, resolveEnquiryContext } from "@/lib/enquiries";
import { getEnquiryConfig } from "@/lib/server/enquiry-config";
import { formatPrice } from "@/lib/properties";
import type { QueryParameters } from "@/lib/property-search";

export const metadata: Metadata = { title: "Contact", description: "Start a conversation about buying or selling with the fictional Aster & Rowe demonstration agency." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<QueryParameters> }) {
  const query = await searchParams;
  const { intent, property } = resolveEnquiryContext(query);
  const { mode } = getEnquiryConfig();
  const content = enquiryContent[intent];
  return <Container className="page-section contact-layout">
    <div className="contact-introduction">
      <SectionHeading eyebrow="CONTACT" title={content.heading}><p>{content.description}</p></SectionHeading>
      {property && <section className="contact-property" aria-labelledby="contact-property-title">
        <h2 id="contact-property-title">{property.title}</h2>
        <p>{property.area}</p>
        <p className="contact-property-price">{formatPrice(property.priceGBP)}</p>
        <Link href={`/properties/${encodeURIComponent(property.slug)}`} className="text-link">View property</Link>
      </section>}
    </div>
    <EnquiryForm key={`${intent}:${property?.slug || ""}:${mode}`} intent={intent} property={property?.slug} mode={mode} today={getToday()} />
  </Container>;
}
