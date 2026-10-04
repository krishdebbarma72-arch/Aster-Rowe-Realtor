import assert from "node:assert/strict";
import { properties } from "../src/lib/properties.ts";
import { getNeighbourhoods } from "../src/lib/neighbourhoods.ts";
import { getPropertyInquiry, getRelatedProperties } from "../src/lib/property-details.ts";

const baseURL = process.env.PREVIEW_URL || "http://localhost:3000";

async function read(path, expectedStatus = 200) {
  const response = await fetch(new URL(path, baseURL));
  const html = await response.text();
  assert.equal(response.status, expectedStatus, path);
  assert.ok(html.includes("<title>"), `Page title: ${path}`);
  assert.ok(!/<(?:img|video)\b/i.test(html), `Empty media: ${path}`);
  assert.ok(html.includes("Demonstration website."), `Demo disclosure: ${path}`);
  // Dynamic not-found responses carry the layout in the client recovery payload.
  // Inspect that recovered footer in the browser; normal pages expose it in HTML.
  if (expectedStatus !== 404) {
    assert.match(html, /<body[^>]*\bid="page-top"/, `Shared top anchor: ${path}`);
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer, `Shared footer: ${path}`);
    assert.match(footer, /<a\b[^>]*href="#page-top"[^>]*>Back to top<\/a>/, `Native top link: ${path}`);
    assert.ok(footer.includes('id="footer-explore-title">Explore</h2>'), `Footer group label: ${path}`);
    for (const route of ["/properties", "/sell", "/about", "/contact"]) {
      assert.ok(footer.includes(`href="${route}"`), `Footer destination ${route}: ${path}`);
    }
  }
  assert.equal(html.includes('class="closing-contact-section"'), path === "/", `Homepage-only closing section: ${path}`);
  console.log(`${response.status} ${path}`);
  return html;
}

const homepage = await read("/");
assert.ok(homepage.includes("SELECTED HOMES"));
assert.ok(homepage.includes("Find a place to make your own."));
assert.equal((homepage.match(/class="property-card"/g) || []).length, 3);
assert.equal((homepage.match(/class="property-card-title"/g) || []).length, 3);
const sectionClasses = ["home-hero", "featured-properties", "seller-section", "neighbourhoods-section", "closing-contact-section", "site-footer"];
const sectionPositions = sectionClasses.map((name) => homepage.indexOf(`class="${name}"`));
assert.ok(sectionPositions.every((position, index) => position >= 0 && (index === 0 || position > sectionPositions[index - 1])), "Homepage section order");
const closing = homepage.match(/<section class="closing-contact-section"[\s\S]*?<\/section>/)?.[0];
assert.ok(closing?.includes('href="/contact"') && closing.includes("Start a conversation"));
assert.ok(closing.includes('href="/sell"') && closing.includes("Request a valuation"));
for (const { area, count, href } of getNeighbourhoods()) {
  assert.ok(homepage.includes(`href="${href}"`));
  const filtered = await read(href);
  assert.equal((filtered.match(/class="property-card"/g) || []).length, count);
  assert.ok(filtered.includes(area));
}
for (const route of ["/properties", "/sell", "/about", "/contact"]) await read(route);
for (const property of properties) {
  const html = await read(`/properties/${property.slug}`);
  const clean = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const heading of [property.title, "About this home", "Key features", "Property details", "Other homes to explore"]) assert.ok(clean.includes(heading));
  assert.ok(html.includes('aria-label="Breadcrumb"'));
  assert.ok(!html.includes('id="property-floor-plan-title"'));
  assert.ok(!html.includes('aria-label="Previous image"') && !html.includes('aria-label="Next image"'));
  assert.ok(html.includes('class="property-main-image" aria-hidden="true"'));
  assert.ok(clean.includes("Illustrative demonstration listing for the fictional"));
  assert.ok(!/<script[^>]*type="application\/ld\+json"/.test(html));
  assert.ok(!html.includes("Council tax band") && !html.includes("EPC rating") && !html.includes("Tenure"));
  const inquiry = getPropertyInquiry(property);
  assert.ok(clean.includes(inquiry.heading) && clean.includes(inquiry.action));
  assert.ok(html.includes(`href="${inquiry.href.replaceAll("&", "&amp;")}"`));
  if (inquiry.questionHref) assert.ok(html.includes(`href="${inquiry.questionHref.replaceAll("&", "&amp;")}"`));
  if (property.availability !== "For sale") assert.ok(!html.includes("intent=viewing"));
  const related = getRelatedProperties(property);
  assert.equal((html.match(/class="property-card"/g) || []).length, related.length);
  for (const record of related) assert.ok(html.includes(`href="/properties/${record.slug}"`));
  if (inquiry.href.startsWith("/contact")) await read(inquiry.href);
}
await read("/properties/no-such-home", 404);

const combined = await read("/properties?location=Greenwich&propertyType=Apartment&maxPrice=500000&minBedrooms=1");
assert.ok(combined.replace(/<!--[\s\S]*?-->/g, "").includes("1 property"));
assert.equal((combined.match(/class="property-card"/g) || []).length, 1);
assert.ok(combined.includes("greenwich-one-bedroom-apartment"));

const none = await read("/properties?minBedrooms=5");
assert.ok(none.includes("No homes match these filters."));
assert.ok(none.includes("Try a higher budget, fewer bedrooms, or a wider search."));
assert.equal((none.match(/class="property-card"/g) || []).length, 0);

const invalid = await read("/properties?location=Atlantis&maxPrice=NaN&minBedrooms=9");
assert.equal((invalid.match(/class="property-card"/g) || []).length, 6);

async function checkListing(path, expectedIds, selections = {}) {
  const html = await read(path);
  const cards = html.match(/<a\b[^>]*class="property-card-link"[^>]*>/g) || [];
  const slugs = cards.map((card) => card.match(/href="\/properties\/([^"]+)"/)[1]);
  assert.deepEqual(slugs, expectedIds.map((id) => properties.find((property) => property.id === id).slug), `Card order: ${path}`);
  const count = html.replace(/<!--[\s\S]*?-->/g, "").match(/class="result-count"[^>]*>([^<]*)</)[1];
  assert.equal(count, `${expectedIds.length} ${expectedIds.length === 1 ? "property" : "properties"}`);
  for (const name of ["location", "propertyType", "maxPrice", "minBedrooms", "sort"]) {
    const select = html.match(new RegExp(`<select[^>]*name="${name}"[^>]*>([\\s\\S]*?)<\\/select>`))[1];
    const selected = (select.match(/<option\b[^>]*>/g) || []).find((option) => option.includes("selected="));
    assert.equal(selected?.match(/value="([^"]*)"/)[1], selections[name] || "", `Selected ${name}: ${path}`);
  }
  assert.ok(html.includes('aria-label="Filter and sort properties"'));
  assert.ok(html.includes("Apply filters"));
  return html;
}
const originalIds = properties.map(({ id }) => id);
await checkListing("/properties", originalIds);
await checkListing("/properties?location=Islington", ["ar-001"], { location: "Islington" });
await checkListing("/properties?propertyType=Apartment", ["ar-002", "ar-005"], { propertyType: "Apartment" });
await checkListing("/properties?maxPrice=750000", ["ar-002", "ar-005"], { maxPrice: "750000" });
await checkListing("/properties?minBedrooms=3", ["ar-003", "ar-004", "ar-006"], { minBedrooms: "3" });
await checkListing("/properties?sort=price-asc", ["ar-005", "ar-002", "ar-001", "ar-006", "ar-004", "ar-003"], { sort: "price-asc" });
await checkListing("/properties?sort=price-desc", ["ar-003", "ar-004", "ar-006", "ar-001", "ar-002", "ar-005"], { sort: "price-desc" });
await checkListing("/properties?sort=bedrooms-desc", ["ar-003", "ar-004", "ar-006", "ar-001", "ar-002", "ar-005"], { sort: "bedrooms-desc" });
const withChips = await checkListing("/properties?propertyType=Apartment&maxPrice=750000&minBedrooms=2&sort=price-asc", ["ar-002"], { propertyType: "Apartment", maxPrice: "750000", minBedrooms: "2", sort: "price-asc" });
assert.ok(withChips.includes('href="/properties?propertyType=Apartment&amp;maxPrice=750000&amp;sort=price-asc"'));
await checkListing("/properties?propertyType=Apartment&maxPrice=750000&sort=price-asc", ["ar-005", "ar-002"], { propertyType: "Apartment", maxPrice: "750000", sort: "price-asc" });
await checkListing("/properties?location=Islington&maxPrice=500000&sort=price-desc", [], { location: "Islington", maxPrice: "500000", sort: "price-desc" });
await checkListing("/properties?location=Islington&location=Greenwich&sort=price-desc&sort=price-asc", ["ar-001"], { location: "Islington", sort: "price-desc" });
await checkListing("/properties?location=Atlantis&location=Islington&maxPrice=NaN&sort=newest", originalIds);

const contactCases = [
  ["/contact", "Your next move starts here.", ["subject"], undefined],
  ["/contact?intent=viewing&property=islington-garden-maisonette", "Request a viewing.", ["preferredDate", "preferredTime"], properties[0]],
  ["/contact?intent=question&property=hackney-loft-apartment", "Ask about this home.", [], properties[1]],
  ["/contact?intent=valuation&property=islington-garden-maisonette", "Tell us about your property.", ["propertyArea", "propertyType", "bedrooms", "timeframe"], undefined],
  ["/contact?intent=viewing&property=dulwich-terraced-house", "Ask about this home.", [], properties[5]],
  ["/contact?intent=viewing&property=hackney-loft-apartment", "Ask about this home.", [], properties[1]],
  ["/contact?intent=viewing&property=invalid", "Your next move starts here.", ["subject"], undefined],
  ["/contact?intent=question", "Your next move starts here.", ["subject"], undefined],
  ["/contact?intent=unsupported&property=islington-garden-maisonette", "Your next move starts here.", ["subject"], undefined],
];
let demoMode = false;
for (const [path, heading, extraFields, property] of contactCases) {
  const html = await read(path);
  assert.equal((html.match(/<form\b/g) || []).length, 1);
  assert.ok(html.includes(heading));
  for (const name of ["fullName", "email", "phone", "message"]) assert.ok(html.includes(`name="${name}"`));
  for (const name of ["subject", "preferredDate", "preferredTime", "propertyArea", "propertyType", "bedrooms", "timeframe"]) assert.equal(html.includes(`name="${name}"`), extraFields.includes(name), `Relevant field ${name}: ${path}`);
  if (property) {
    assert.ok(html.includes(property.title));
    assert.ok(html.includes(`href="/properties/${property.slug}"`) && html.includes("View property"));
  } else assert.ok(!html.includes('class="contact-property"'));
  demoMode = html.includes("Demo form. Your details will not be sent or stored.");
  if (demoMode) assert.ok(html.includes("Preview enquiry"));
  assert.ok(!html.includes("ENQUIRY_WEBHOOK_URL"));
}
if (demoMode) {
  const endpoint = new URL("/api/enquiries", baseURL);
  const valid = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intent: "general", fullName: "Demo Visitor", email: "preview@example.test", message: "Fictional route test." }) });
  assert.equal(valid.status, 200);
  assert.equal(valid.headers.get("cache-control"), "no-store");
  assert.deepEqual(await valid.json(), { ok: true, mode: "demo", message: "Preview complete. No enquiry has been sent." });
  const invalid = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intent: "unsupported" }) });
  assert.equal(invalid.status, 400);
  assert.ok((await invalid.json()).errors.intent);
  const malformed = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal(malformed.status, 400);
  const oversized = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: "x".repeat(24001) });
  assert.equal(oversized.status, 413);
  console.log("Demo API validation, malformed requests, size limit and non-delivery response passed.");
} else console.log("Demo API checks skipped: the preview is not in demo mode. Live delivery is tested only with mocks.");
console.log("Route, status, media, metadata, search, contact flows, homepage composition and shared footer checks passed.");
