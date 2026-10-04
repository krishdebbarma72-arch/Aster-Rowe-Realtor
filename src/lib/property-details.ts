import { formatArea, properties, type Property } from "./properties.ts";
import type { MediaImage, PropertyMedia } from "./media.ts";

export function getInquiryHref(slug: string, intent: "viewing" | "question") {
  return `/contact?${new URLSearchParams({ intent, property: slug }).toString()}`;
}

export function getPropertyInquiry(property: Property) {
  if (property.availability === "For sale") return {
    heading: "Take a closer look.",
    description: "Request a viewing or ask a question about this home.",
    action: "Request a viewing",
    href: getInquiryHref(property.slug, "viewing"),
    questionHref: getInquiryHref(property.slug, "question"),
  };
  if (property.availability === "Under offer") return {
    heading: "Interested in this home?",
    description: "Ask about its current status or explore other properties.",
    action: "Ask about this property",
    href: getInquiryHref(property.slug, "question"),
  };
  return {
    heading: "Explore your next possibility.",
    description: "Browse other homes in the property collection.",
    action: "Explore other properties",
    href: "/properties",
  };
}

export function getPropertyDetails(property: Property) {
  const rows = [
    { label: "Property type", value: property.propertyType },
    { label: property.bedrooms === 1 ? "Bedroom" : "Bedrooms", value: String(property.bedrooms) },
    { label: property.bathrooms === 1 ? "Bathroom" : "Bathrooms", value: String(property.bathrooms) },
    { label: "Interior area", value: formatArea(property.interiorSqFt) },
    { label: "Availability", value: property.availability },
  ];
  const optional: readonly [string, string | undefined][] = [
    ["Tenure", property.tenure], ["Council tax band", property.councilTaxBand], ["EPC rating", property.epcRating],
  ];
  for (const [label, value] of optional) {
    if (value?.trim()) rows.push({ label, value });
  }
  return rows;
}

/** Area, then type, then original order; only other available records qualify. */
export function getRelatedProperties(property: Property, records: readonly Property[] = properties): readonly Property[] {
  const available = records.filter((record) => record.id !== property.id && record.slug !== property.slug && record.availability === "For sale");
  const candidates = [
    ...available.filter((record) => record.area === property.area),
    ...available.filter((record) => record.propertyType === property.propertyType),
    ...available,
  ];
  const seen = new Set<string>();
  return candidates.filter((record) => {
    if (seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  }).slice(0, 3);
}

/** Main photograph leads. Empty slots and repeated files never create slides. */
export function getPropertyGalleryImages(media: PropertyMedia): readonly MediaImage[] {
  const seen = new Set<string>();
  return [media.mainImage, ...media.gallery].filter((image): image is MediaImage => {
    if (!image?.src.trim() || !image.alt.trim() || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

export function getGalleryIndex(index: number, count: number, direction: -1 | 1): number {
  return count > 0 ? (index + direction + count) % count : 0;
}
