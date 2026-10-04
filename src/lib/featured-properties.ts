import { properties, type Property } from "./properties.ts";

/** Editorial order only; listing details remain in the shared dataset. */
export const featuredPropertyIds: readonly string[] = ["ar-001", "ar-004", "ar-005"];

export function getFeaturedProperties(records: readonly Property[] = properties): readonly Property[] {
  const available = new Map(records.filter((property) => property.availability === "For sale")
    .map((property) => [property.id, property]));
  const orderedIds = [...new Set([...featuredPropertyIds, ...available.keys()])];
  return orderedIds.map((id) => available.get(id))
    .filter((property): property is Property => Boolean(property)).slice(0, 3);
}
