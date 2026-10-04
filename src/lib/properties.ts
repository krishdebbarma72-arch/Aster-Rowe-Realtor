import { propertyMedia, type PropertyMedia } from "./media.ts";

export type PropertyType = "Apartment" | "Terraced house" | "Maisonette" | "Detached house" | "Mews house";
export type Availability = "For sale" | "Under offer" | "Sold";

export interface Property {
  id: string;
  slug: string;
  title: string;
  area: string;
  displayLocation: string;
  priceGBP: number;
  bedrooms: number;
  bathrooms: number;
  interiorSqFt: number;
  propertyType: PropertyType;
  availability: Availability;
  tenure?: string;
  councilTaxBand?: string;
  epcRating?: string;
  description: string;
  keyFeatures: readonly string[];
  media: PropertyMedia;
  isDemo: true;
}

/** Fictional sale listings. No precise addresses or real property claims. */
export const properties: readonly Property[] = [
  {
    id: "ar-001", slug: "islington-garden-maisonette", title: "A garden maisonette",
    area: "Islington", displayLocation: "Islington, North London", priceGBP: 925000,
    bedrooms: 2, bathrooms: 2, interiorSqFt: 1040, propertyType: "Maisonette", availability: "For sale",
    description: "This two-bedroom maisonette in Islington is arranged over two floors, with 1,040 sq ft of interior space. It has a separate kitchen and two bathrooms, including an en suite to the main bedroom. A private rear garden adds outdoor space to the home.",
    keyFeatures: ["Private rear garden", "Two floors", "Separate kitchen", "Main bedroom with en suite"],
    media: propertyMedia["ar-001"], isDemo: true,
  },
  {
    id: "ar-002", slug: "hackney-loft-apartment", title: "An open-plan loft",
    area: "Hackney", displayLocation: "Hackney, East London", priceGBP: 675000,
    bedrooms: 2, bathrooms: 1, interiorSqFt: 880, propertyType: "Apartment", availability: "Under offer",
    description: "High ceilings and an open-plan kitchen and living area define this loft apartment in Hackney. Its 880 sq ft of interior space includes two double bedrooms and one bathroom. A shared courtyard provides outdoor space. The property is currently under offer.",
    keyFeatures: ["Open-plan kitchen and living space", "High ceilings", "Two double bedrooms", "Shared courtyard"],
    media: propertyMedia["ar-002"], isDemo: true,
  },
  {
    id: "ar-003", slug: "richmond-detached-house", title: "A house with room to grow",
    area: "Richmond", displayLocation: "Richmond, South West London", priceGBP: 1950000,
    bedrooms: 4, bathrooms: 3, interiorSqFt: 2460, propertyType: "Detached house", availability: "For sale",
    description: "A garden-facing kitchen and separate reception room are among the spaces in this four-bedroom detached house in Richmond. The home has 2,460 sq ft of interior space and three bathrooms, with space for a home office. A private garden provides outdoor space.",
    keyFeatures: ["Four bedrooms", "Garden-facing kitchen", "Separate reception room", "Home office", "Private garden"],
    media: propertyMedia["ar-003"], isDemo: true,
  },
  {
    id: "ar-004", slug: "marylebone-mews-house", title: "A quiet mews house",
    area: "Marylebone", displayLocation: "Marylebone, Central London", priceGBP: 1650000,
    bedrooms: 3, bathrooms: 2, interiorSqFt: 1580, propertyType: "Mews house", availability: "For sale",
    description: "Arranged over three floors, this Marylebone mews house has three bedrooms and 1,580 sq ft of interior space. The reception room is on the first floor, and there are two bathrooms, including an en suite to the main bedroom. A compact roof terrace provides outdoor space.",
    keyFeatures: ["Three floors", "Roof terrace", "First-floor reception room", "Main bedroom with en suite"],
    media: propertyMedia["ar-004"], isDemo: true,
  },
  {
    id: "ar-005", slug: "greenwich-one-bedroom-apartment", title: "A light-filled apartment",
    area: "Greenwich", displayLocation: "Greenwich, South East London", priceGBP: 425000,
    bedrooms: 1, bathrooms: 1, interiorSqFt: 560, propertyType: "Apartment", availability: "For sale",
    description: "With an open-plan living area and built-in storage, this one-bedroom apartment in Greenwich has 560 sq ft of interior space. The kitchen and living area are connected, and the accommodation includes a double bedroom and one bathroom. A private balcony provides outdoor space.",
    keyFeatures: ["Private balcony", "Open-plan living area", "Built-in storage", "One double bedroom"],
    media: propertyMedia["ar-005"], isDemo: true,
  },
  {
    id: "ar-006", slug: "dulwich-terraced-house", title: "A thoughtfully arranged terrace",
    area: "Dulwich", displayLocation: "Dulwich, South London", priceGBP: 1125000,
    bedrooms: 3, bathrooms: 2, interiorSqFt: 1440, propertyType: "Terraced house", availability: "Sold",
    description: "A separate front reception room and an extended kitchen form part of this three-bedroom terraced house in Dulwich. The home has 1,440 sq ft of interior space and two bathrooms, together with a private rear garden. The property is sold.",
    keyFeatures: ["Extended kitchen", "Private rear garden", "Separate reception room", "Three bedrooms"],
    media: propertyMedia["ar-006"], isDemo: true,
  },
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((property) => property.slug === slug);
}

export function formatPrice(priceGBP: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(priceGBP);
}

export function formatArea(interiorSqFt: number): string {
  return `${new Intl.NumberFormat("en-GB").format(interiorSqFt)} sq ft`;
}
