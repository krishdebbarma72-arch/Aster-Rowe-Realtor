import test from "node:test";
import assert from "node:assert/strict";
import { properties } from "../src/lib/properties.ts";
import { getEnquirySummary, getToday, liveError, liveSuccess, previewComplete, resolveEnquiryContext, validateEnquiry } from "../src/lib/enquiries.ts";
import { submitEnquiry } from "../src/lib/server/enquiry-delivery.ts";

const common = { fullName: "  Demo Visitor  ", email: " visitor+preview@example.test ", phone: " +44 (0)20 0000 0000 ", message: "  A fictional test enquiry.  " };
const general = { ...common, intent: "general", subject: "Buying a property" };
const available = properties.find((property) => property.availability === "For sale")!;
const mockConfig = { mode: "live" as const, webhookUrl: "https://receiver.example.invalid/enquiries" };

test("URL intent fallback, first-value policy and availability resolve exclusively from the dataset", () => {
  for (const query of [{}, { intent: "unknown", property: available.slug }, { intent: "viewing" }, { intent: "question", property: "not-a-property" }, { intent: ["unknown", "viewing"], property: available.slug }]) assert.deepEqual(resolveEnquiryContext(query), { intent: "general" });
  assert.deepEqual(resolveEnquiryContext({ intent: "valuation", property: available.slug }), { intent: "valuation" });
  assert.deepEqual(resolveEnquiryContext({ intent: "general", property: available.slug }), { intent: "general" });
  assert.equal(resolveEnquiryContext({ intent: "viewing", property: available.slug }).property, available);
  for (const property of properties.filter((record) => record.availability !== "For sale")) assert.deepEqual(resolveEnquiryContext({ intent: "viewing", property: property.slug }), { intent: "question", property });
});

test("all four payloads trim fields and retain only relevant validated values", () => {
  const inputs = [general,
    { ...common, intent: "viewing", property: available.slug, preferredDate: "2030-10-04", preferredTime: "Morning", subject: "invalid" },
    { ...common, intent: "question", property: available.slug, preferredDate: "invalid" },
    { ...common, intent: "valuation", property: "ignore-me", propertyArea: " N1 ", propertyType: "Other", bedrooms: "3", timeframe: "Within 3 months" },
  ];
  for (const input of inputs) {
    const result = validateEnquiry({ ...input, propertyContext: { title: "Forged" }, internal: "drop" }, "2030-10-03");
    assert.ok(result.valid);
    assert.equal(result.payload.fullName, "Demo Visitor");
    assert.equal(result.payload.email, "visitor+preview@example.test");
    assert.equal(result.payload.message, "A fictional test enquiry.");
    assert.ok(!("internal" in result.payload) && !("propertyContext" in result.payload));
    if (result.payload.intent === "valuation") { assert.equal(result.payload.bedrooms, 3); assert.ok(!("property" in result.payload)); }
    if (result.payload.intent === "question") assert.ok(!("preferredDate" in result.payload));
  }
});

test("required fields, unsupported intents, invalid references and length limits fail server validation", () => {
  const empty = validateEnquiry({ intent: "general" });
  assert.ok(!empty.valid);
  assert.deepEqual(Object.keys(empty.errors), ["fullName", "email", "message"]);
  for (const [field, value] of [["email", "invalid"], ["email", "a@b"], ["fullName", "x".repeat(121)], ["message", "x".repeat(5001)], ["phone", "x".repeat(51)], ["intent", "unsupported"], ["subject", "invalid"]] as const) {
    const result = validateEnquiry({ ...general, [field]: value });
    assert.ok(!result.valid && result.errors[field]);
  }
  for (const intent of ["viewing", "question"]) {
    const result = validateEnquiry({ ...common, intent, property: "invented" });
    assert.ok(!result.valid && result.errors.property);
  }
  assert.ok(!validateEnquiry(null).valid);
  assert.ok(!validateEnquiry({ ...general, email: ["visitor@example.test"] }).valid);
});

test("viewing dates must exist and not be past; unavailable viewing requests become questions", () => {
  const base = { ...common, intent: "viewing", property: available.slug };
  for (const preferredDate of ["2029-12-31", "2030-02-30", "tomorrow"]) {
    const result = validateEnquiry({ ...base, preferredDate }, "2030-01-01");
    assert.ok(!result.valid && result.errors.preferredDate);
  }
  assert.ok(validateEnquiry({ ...base, preferredDate: "2030-01-01" }, "2030-01-01").valid);
  assert.ok(!validateEnquiry({ ...base, preferredTime: "Midnight" }).valid);
  for (const property of properties.filter((record) => record.availability !== "For sale")) {
    const result = validateEnquiry({ ...base, property: property.slug, preferredDate: "invalid", preferredTime: "invalid" });
    assert.ok(result.valid);
    assert.equal(result.payload.intent, "question");
    assert.ok(!("preferredDate" in result.payload));
  }
  assert.equal(getToday(new Date("2030-06-01T23:30:00Z")), "2030-06-02");
});

test("valuation details, bedrooms, type and timeframe are validated", () => {
  const valuation = { ...common, intent: "valuation", propertyArea: "N1", propertyType: "Apartment" };
  for (const changes of [{ propertyArea: " " }, { propertyArea: "x".repeat(121) }, { propertyType: "Castle" }, { bedrooms: "2.5" }, { bedrooms: -1 }, { bedrooms: 21 }, { timeframe: "Tomorrow" }]) assert.ok(!validateEnquiry({ ...valuation, ...changes }).valid);
  assert.ok(validateEnquiry({ ...valuation, bedrooms: "0" }).valid);
});

test("preview context uses record data and never implies an appointment or delivery", () => {
  const result = validateEnquiry({ ...common, intent: "viewing", property: available.slug });
  assert.ok(result.valid);
  const summary = getEnquirySummary(result.payload);
  assert.ok(summary.find((row) => row.label === "Property")?.value.includes(available.title));
  assert.equal(summary.find((row) => row.label === "Preferred time of day")?.value, "No preference");
});

test("demo endpoint never calls a delivery transport or echoes submitted details", async () => {
  let calls = 0;
  const transport: typeof fetch = async () => { calls++; throw new Error("No network in demo"); };
  const result = await submitEnquiry(general, { mode: "demo", webhookUrl: mockConfig.webhookUrl }, transport);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, mode: "demo", message: previewComplete });
  assert.equal(calls, 0);
  assert.ok(!JSON.stringify(result).includes("visitor+preview"));
  const invalid = await submitEnquiry({ intent: "general" }, { mode: "demo" }, transport);
  assert.equal(invalid.status, 400);
  assert.equal(calls, 0);
});

test("live delivery sends only validated fields and server-resolved property context", async () => {
  let calls = 0;
  const transport: typeof fetch = async (destination, init) => {
    calls++;
    assert.equal(destination, mockConfig.webhookUrl);
    assert.equal(init?.method, "POST");
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    assert.ok(init?.signal instanceof AbortSignal);
    const body = JSON.parse(String(init?.body));
    assert.equal(body.fullName, "Demo Visitor");
    assert.equal(body.propertyContext.title, available.title);
    assert.equal(body.propertyContext.priceGBP, available.priceGBP);
    assert.ok(!("subject" in body) && !("forged" in body));
    return new Response(null, { status: 204 });
  };
  const result = await submitEnquiry({ ...common, intent: "viewing", property: available.slug, subject: "discard", forged: "discard", propertyContext: { title: "Forged" } }, mockConfig, transport);
  assert.equal(calls, 1);
  assert.deepEqual(result, { status: 200, body: { ok: true, mode: "live", message: liveSuccess } });
});

test("missing or invalid live configuration and failed delivery return the same safe error", async () => {
  let calls = 0;
  const transport: typeof fetch = async () => { calls++; return new Response(null, { status: 500 }); };
  for (const webhookUrl of [undefined, "", "not-a-url", "http://receiver.example.invalid", "https://secret:credential@receiver.example.invalid"]) {
    const result = await submitEnquiry(general, { mode: "live", webhookUrl }, transport);
    assert.deepEqual(result, { status: 503, body: { ok: false, message: liveError } });
  }
  assert.equal(calls, 0);
  const failed = await submitEnquiry(general, mockConfig, transport);
  assert.deepEqual(failed, { status: 503, body: { ok: false, message: liveError } });
  const rejected = await submitEnquiry(general, mockConfig, async () => { throw new Error("Private stack / credentials"); });
  assert.deepEqual(rejected, failed);
  const invalid = await submitEnquiry({ ...general, email: "invalid" }, mockConfig, transport);
  assert.equal(invalid.status, 400);
  assert.equal(calls, 1);
});

test("a stalled live transport is aborted within the bounded timeout and reports failure", { timeout: 12000 }, async () => {
  const transport: typeof fetch = (_destination, init) => new Promise((_resolve, reject) => {
    const keepAlive = setTimeout(() => reject(new Error("Timeout did not abort")), 11000);
    init!.signal!.addEventListener("abort", () => { clearTimeout(keepAlive); reject(init!.signal!.reason); }, { once: true });
  });
  const started = Date.now();
  const result = await submitEnquiry(general, mockConfig, transport);
  assert.ok(Date.now() - started < 10000);
  assert.deepEqual(result, { status: 503, body: { ok: false, message: liveError } });
});
