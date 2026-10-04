import { properties, type Property } from "./properties.ts";
import { filterProperties, getPropertyLocations } from "./property-search.ts";

export function formatPropertyCount(count: number): string {
  return `${count} ${count === 1 ? "property" : "properties"}`;
}

/** Exact area values and matching rules are shared with the property search. */
export function getNeighbourhoods(records: readonly Property[] = properties) {
  return getPropertyLocations(records).slice(0, 4).map((area) => ({
    area,
    count: filterProperties({ location: area }, records).length,
    href: `/properties?${new URLSearchParams({ location: area }).toString()}`,
  }));
}
