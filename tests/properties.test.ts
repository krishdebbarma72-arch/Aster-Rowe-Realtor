import assert from "node:assert/strict";
import test from "node:test";
import { properties, getPropertyBySlug, formatArea, formatPrice, type Property } from "../src/lib/properties.ts";
import { heroMedia, propertyMedia } from "../src/lib/media.ts";
import { filterProperties, parsePropertyFilters, summariseFilters, locations, getPropertyLocations, parsePropertySort, sortProperties, getActivePropertyFilters, getPropertySearchHref, filterNames } from "../src/lib/property-search.ts";
import { getFeaturedProperties } from "../src/lib/featured-properties.ts";
import { getNeighbourhoods, formatPropertyCount } from "../src/lib/neighbourhoods.ts";
import { getPropertyInquiry, getInquiryHref, getPropertyDetails, getRelatedProperties, getPropertyGalleryImages, getGalleryIndex } from "../src/lib/property-details.ts";

test("six unique demo listings resolve by stable slug, and unknown slugs do not", () => {
  assert.equal(properties.length, 6);
  assert.equal(new Set(properties.map((property) => property.id)).size, 6);
  assert.equal(new Set(properties.map((property) => property.slug)).size, 6);
  for (const property of properties) {
    assert.equal(getPropertyBySlug(property.slug), property);
    assert.equal(property.isDemo, true);
    assert.ok(property.priceGBP > 0 && property.interiorSqFt > 0);
    assert.ok(property.bedrooms >= 1 && property.bathrooms >= 1);
    assert.equal(property.media, propertyMedia[property.id]);
  }
  assert.equal(getPropertyBySlug("unknown-property"), undefined);
});

test("all future asset slots are empty and amounts use British units", () => {
  assert.equal(heroMedia.videoSrc, null);
  assert.equal(heroMedia.posterImage, null);
  assert.ok(properties.every((property) => property.media.mainImage === null && property.media.gallery.length === 0 && property.media.floorPlan === null));
  assert.equal(formatPrice(925000), "£925,000");
  assert.equal(formatArea(1040), "1,040 sq ft");
});

test("default and invalid query values give unrestricted results", () => {
  assert.equal(filterProperties(parsePropertyFilters({})).length, 6);
  const filters = parsePropertyFilters({ location: "Atlantis", propertyType: "Castle", maxPrice: "Infinity", minBedrooms: ["invalid", "5"] });
  assert.equal(filterProperties(filters).length, 6);
  assert.deepEqual(summariseFilters(filters), []);
  for (const maxPrice of ["-1", "NaN", "500001", "500000abc", "5e5", ""]) {
    assert.equal(parsePropertyFilters({ maxPrice }).maxPrice, undefined);
  }
});

test("filters combine with AND and boundaries are inclusive", () => {
  const filters = parsePropertyFilters({ location: "Greenwich", propertyType: "Apartment", maxPrice: "500000", minBedrooms: "1" });
  assert.deepEqual(filterProperties(filters).map((property) => property.id), ["ar-005"]);
  assert.deepEqual(summariseFilters(filters), ["Greenwich", "Apartment", "Up to £500,000", "1+ bedroom"]);
  assert.deepEqual(filterProperties({ maxPrice: 675000, minBedrooms: 2 }).map((property) => property.id), ["ar-002"]);
  assert.equal(filterProperties(parsePropertyFilters({ location: "Greenwich", minBedrooms: "4" })).length, 0);
  assert.equal(filterProperties(parsePropertyFilters({ minBedrooms: "5" })).length, 0);
});

test("featured selection uses existing available records without duplicates", () => {
  const featured = getFeaturedProperties();
  assert.deepEqual(featured.map((property) => property.id), ["ar-001", "ar-004", "ar-005"]);
  assert.ok(featured.every((property) => properties.includes(property) && property.availability === "For sale"));
  const onlyTwo = properties.filter((property) => ["ar-001", "ar-003"].includes(property.id));
  assert.deepEqual(getFeaturedProperties([...onlyTwo, onlyTwo[0]]).map((property) => property.id), ["ar-001", "ar-003"]);
  assert.deepEqual(getFeaturedProperties(properties.filter((property) => property.availability !== "For sale")), []);
  assert.deepEqual(getFeaturedProperties([]), []);
});

test("neighbourhoods share location values, counts and safely encoded filters", () => {
  const neighbourhoods = getNeighbourhoods();
  assert.deepEqual(neighbourhoods.map(({ area }) => area), locations.slice(0, 4));
  for (const { area, count, href } of neighbourhoods) {
    const query = Object.fromEntries(new URL(href, "https://example.test").searchParams);
    assert.equal(query.location, area);
    assert.equal(filterProperties(parsePropertyFilters(query)).length, count);
  }
  assert.equal(formatPropertyCount(1), "1 property");
  assert.equal(formatPropertyCount(2), "2 properties");
});

test("area selection omits blanks, deduplicates, limits to four and handles fewer or no areas", () => {
  const withArea = (area: string): Property => ({ ...properties[0], area });
  const records = ["", "   ", "Z", "A & B", "A & B", "C", "D", "E"].map(withArea);
  assert.deepEqual(getPropertyLocations(records), ["A & B", "C", "D", "E", "Z"]);
  const selected = getNeighbourhoods(records);
  assert.deepEqual(selected.map(({ area }) => area), ["A & B", "C", "D", "E"]);
  assert.equal(selected[0].count, 2);
  assert.equal(selected[0].href, "/properties?location=A+%26+B");
  assert.equal(getNeighbourhoods([withArea("One area")]).length, 1);
  assert.deepEqual(getNeighbourhoods([withArea(" ")]), []);
  assert.deepEqual(getNeighbourhoods([]), []);
});

test("viewing actions respect availability and preserve safely encoded inquiry context", () => {
  const available = getPropertyInquiry(properties[0]);
  assert.equal(available.action, "Request a viewing");
  const viewing = new URL(available.href, "https://example.test");
  assert.equal(viewing.searchParams.get("intent"), "viewing");
  assert.equal(viewing.searchParams.get("property"), properties[0].slug);
  assert.equal(new URL(available.questionHref!, "https://example.test").searchParams.get("intent"), "question");
  const underOffer = getPropertyInquiry(properties[1]);
  assert.equal(underOffer.action, "Ask about this property");
  assert.equal(new URL(underOffer.href, "https://example.test").searchParams.get("intent"), "question");
  assert.equal(underOffer.questionHref, undefined);
  const sold = getPropertyInquiry(properties[5]);
  assert.equal(sold.action, "Explore other properties");
  assert.equal(sold.href, "/properties");
  assert.equal(sold.questionHref, undefined);
  const encoded = new URL(getInquiryHref("a home & more?", "question"), "https://example.test");
  assert.deepEqual([...encoded.searchParams], [["intent", "question"], ["property", "a home & more?"]]);
});

test("related selection prioritises area then type, excludes unavailable/current records and deduplicates", () => {
  assert.deepEqual(getRelatedProperties(properties[1]).map(({ id }) => id), ["ar-005", "ar-001", "ar-003"]);
  const current = properties[0];
  const sameArea = { ...properties[3], area: current.area };
  const sameType = { ...properties[4], propertyType: current.propertyType };
  const records = [properties[2], sameType, properties[1], sameArea, current, sameArea, properties[5]];
  assert.deepEqual(getRelatedProperties(current, records).map(({ id }) => id), ["ar-004", "ar-005", "ar-003"]);
  assert.deepEqual(getRelatedProperties(current, [current, properties[1], properties[5]]), []);
  assert.deepEqual(getRelatedProperties(current, [properties[2]]), [properties[2]]);
  assert.deepEqual(getRelatedProperties(current, []), []);
});

test("property details use singular labels and omit missing or blank optional information", () => {
  const details = getPropertyDetails(properties[4]);
  assert.deepEqual(details, [
    { label: "Property type", value: "Apartment" }, { label: "Bedroom", value: "1" },
    { label: "Bathroom", value: "1" }, { label: "Interior area", value: "560 sq ft" },
    { label: "Availability", value: "For sale" },
  ]);
  assert.deepEqual(getPropertyDetails({ ...properties[4], tenure: " ", councilTaxBand: "", epcRating: " " }), details);
});

test("empty media remains empty, and gallery navigation handles zero, one and multiple slides", () => {
  for (const property of properties) assert.deepEqual(getPropertyGalleryImages(property.media), []);
  assert.deepEqual(getPropertyGalleryImages({ mainImage: { src: "  ", alt: "" }, gallery: [], floorPlan: null }), []);
  assert.equal(getGalleryIndex(0, 0, 1), 0);
  assert.equal(getGalleryIndex(0, 1, -1), 0);
  assert.equal(getGalleryIndex(0, 1, 1), 0);
  assert.equal(getGalleryIndex(0, 3, -1), 2);
  assert.equal(getGalleryIndex(2, 3, 1), 0);
  assert.equal(getGalleryIndex(0, 3, 1), 1);
});

test("repeated filters and sorting consistently validate only the first value", () => {
  const query = { location: ["Islington", "Greenwich"], propertyType: ["Maisonette", "Apartment"], maxPrice: ["1000000", "500000"], minBedrooms: ["2", "5"], sort: ["price-desc", "price-asc"] };
  assert.deepEqual(parsePropertyFilters(query), { location: "Islington", propertyType: "Maisonette", maxPrice: 1000000, minBedrooms: 2 });
  assert.equal(parsePropertySort(query), "price-desc");
  assert.equal(parsePropertyFilters({ location: ["Atlantis", "Islington"] }).location, undefined);
  assert.equal(parsePropertyFilters({ maxPrice: ["NaN", "500000"] }).maxPrice, undefined);
  assert.equal(parsePropertySort({ sort: ["newest", "price-asc"] }), undefined);
  assert.equal(parsePropertySort({ sort: [] }), undefined);
  assert.equal(parsePropertySort({ sort: "" }), undefined);
  assert.equal(parsePropertySort({ sort: "default" }), undefined);
});

test("each filter and sort use the dataset and keep original order for ties without mutation", () => {
  const ids = (records: readonly Property[]) => records.map(({ id }) => id);
  const original = ids(properties);
  assert.deepEqual(ids(filterProperties({ location: "Islington" })), ["ar-001"]);
  assert.deepEqual(ids(filterProperties({ propertyType: "Apartment" })), ["ar-002", "ar-005"]);
  assert.deepEqual(ids(filterProperties({ maxPrice: 750000 })), ["ar-002", "ar-005"]);
  assert.deepEqual(ids(filterProperties({ minBedrooms: 3 })), ["ar-003", "ar-004", "ar-006"]);
  assert.deepEqual(ids(sortProperties(properties)), original);
  assert.deepEqual(ids(sortProperties(properties, "price-asc")), ["ar-005", "ar-002", "ar-001", "ar-006", "ar-004", "ar-003"]);
  assert.deepEqual(ids(sortProperties(properties, "price-desc")), ["ar-003", "ar-004", "ar-006", "ar-001", "ar-002", "ar-005"]);
  assert.deepEqual(ids(sortProperties(properties, "bedrooms-desc")), ["ar-003", "ar-004", "ar-006", "ar-001", "ar-002", "ar-005"]);
  assert.deepEqual(ids(properties), original);
  const equalPrices = properties.map((property) => ({ ...property, priceGBP: 500000 }));
  assert.deepEqual(ids(sortProperties(equalPrices, "price-asc")), original);
  assert.deepEqual(ids(sortProperties(equalPrices, "price-desc")), original);
  assert.deepEqual(ids(sortProperties(filterProperties({ propertyType: "Apartment" }), "price-asc")), ["ar-005", "ar-002"]);
});

test("filter removal preserves all other valid values and sorting with safe canonical URLs", () => {
  const filters = parsePropertyFilters({ location: "Islington", propertyType: "Maisonette", maxPrice: "1000000", minBedrooms: "2", unsupported: "ignored" });
  assert.deepEqual(getActivePropertyFilters(filters).map(({ label }) => label), ["Islington", "Maisonette", "Up to £1,000,000", "2+ bedrooms"]);
  for (const remove of filterNames) {
    const query = new URL(getPropertySearchHref(filters, "price-asc", remove), "https://example.test").searchParams;
    assert.equal(query.has(remove), false);
    assert.equal(query.get("sort"), "price-asc");
    assert.equal(query.has("unsupported"), false);
    for (const keep of filterNames.filter((name) => name !== remove)) assert.equal(query.get(keep), String(filters[keep]));
  }
  assert.equal(getPropertySearchHref({}), "/properties");
  assert.equal(getPropertySearchHref({}, "price-desc"), "/properties?sort=price-desc");
  assert.equal(new URL(getPropertySearchHref({ location: "A & B" }), "https://example.test").searchParams.get("location"), "A & B");
  assert.deepEqual(getActivePropertyFilters({}), []);
});
