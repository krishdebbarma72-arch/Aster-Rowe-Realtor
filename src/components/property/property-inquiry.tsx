import { getPropertyInquiry } from "@/lib/property-details";
import type { Property } from "@/lib/properties";
import Link from "next/link";
import { ButtonLink } from "../ui/button";

export function PropertyInquiry({ property }: { property: Property }) {
  const inquiry = getPropertyInquiry(property);
  return <aside className="property-inquiry" aria-labelledby="property-inquiry-title">
    <h2 id="property-inquiry-title">{inquiry.heading}</h2>
    <p>{inquiry.description}</p>
    <ButtonLink href={inquiry.href}>{inquiry.action}</ButtonLink>
    {inquiry.questionHref && <Link className="text-link" href={inquiry.questionHref}>Ask a question</Link>}
  </aside>;
}
