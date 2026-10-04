import { properties, formatPrice, type Property } from "./properties.ts";

export function getPropertyLocations(records: readonly Property[] = properties): string[] {
  return [...new Set(records.map((property) => property.area).filter((area) => area.trim().length > 0))].sort();
}

export const locations = getPropertyLocations();
export const propertyTypes = [...new Set(properties.map((property) => property.propertyType).filter((type) => type.trim().length > 0))].sort();
export const maxPrices = [500000, 750000, 1000000, 1500000, 2500000, 5000000] as const;
export const bedroomMinimums = [1, 2, 3, 4, 5] as const;
export const filterNames = ["location", "propertyType", "maxPrice", "minBedrooms"] as const;
export const searchParameterNames = [...filterNames, "sort"] as const;
export const sortOptions = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "bedrooms-desc", label: "Bedrooms: most first" },
] as const;
export type PropertySort = typeof sortOptions[number]["value"];
export type FilterName = typeof filterNames[number];

export type QueryParameters = Record<string, string | string[] | undefined>;
export interface PropertyFilters {
  location?: string;
  propertyType?: string;
  maxPrice?: number;
  minBedrooms?: number;
}

// Repeated parameters use their first value, even when that first value is invalid.
// Only recognised exact strings are accepted; malformed numbers stay unrestricted.
function supported(value: string | string[] | undefined, allowed: readonly string[]) {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && allowed.includes(first) ? first : undefined;
}

export function parsePropertyFilters(query: QueryParameters): PropertyFilters {
  const maxPrice = supported(query.maxPrice, maxPrices.map(String));
  const minBedrooms = supported(query.minBedrooms, bedroomMinimums.map(String));
  return {
    location: supported(query.location, locations),
    propertyType: supported(query.propertyType, propertyTypes),
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
  };
}

export function filterProperties(filters: PropertyFilters, records: readonly Property[] = properties): readonly Property[] {
  return records.filter((property) =>
    (!filters.location || property.area === filters.location) &&
    (!filters.propertyType || property.propertyType === filters.propertyType) &&
    (filters.maxPrice === undefined || property.priceGBP <= filters.maxPrice) &&
    (filters.minBedrooms === undefined || property.bedrooms >= filters.minBedrooms),
  );
}

export function parsePropertySort(query: QueryParameters): PropertySort | undefined {
  return supported(query.sort, sortOptions.map(({ value }) => value)) as PropertySort | undefined;
}

/** Filter first; the remaining records retain dataset order for every tie. */
export function sortProperties(records: readonly Property[], sort?: PropertySort): readonly Property[] {
  return records.map((property, index) => ({ property, index })).sort((a, b) => {
    const difference = sort === "price-asc" ? a.property.priceGBP - b.property.priceGBP
      : sort === "price-desc" ? b.property.priceGBP - a.property.priceGBP
      : sort === "bedrooms-desc" ? b.property.bedrooms - a.property.bedrooms : 0;
    return difference || a.index - b.index;
  }).map(({ property }) => property);
}

export function getActivePropertyFilters(filters: PropertyFilters): { name: FilterName; label: string }[] {
  const active: { name: FilterName; label: string }[] = [];
  if (filters.location) active.push({ name: "location", label: filters.location });
  if (filters.propertyType) active.push({ name: "propertyType", label: filters.propertyType });
  if (filters.maxPrice !== undefined) active.push({ name: "maxPrice", label: `Up to ${formatPrice(filters.maxPrice)}` });
  if (filters.minBedrooms !== undefined) active.push({ name: "minBedrooms", label: `${filters.minBedrooms}+ ${filters.minBedrooms === 1 ? "bedroom" : "bedrooms"}` });
  return active;
}

export function getPropertySearchHref(filters: PropertyFilters, sort?: PropertySort, remove?: FilterName): string {
  const query = new URLSearchParams();
  for (const name of filterNames) {
    const value = filters[name];
    if (name !== remove && value !== undefined && value !== "") query.set(name, String(value));
  }
  if (sort) query.set("sort", sort);
  const encoded = query.toString();
  return `/properties${encoded ? `?${encoded}` : ""}`;
}

export function summariseFilters(filters: PropertyFilters): string[] {
  return getActivePropertyFilters(filters).map(({ label }) => label);
}
