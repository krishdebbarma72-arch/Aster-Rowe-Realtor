import { getPropertyBySlug, formatPrice } from "../properties.ts";
import { validateEnquiry, previewComplete, liveSuccess, liveError, type EnquiryPayload, type EnquiryMode } from "../enquiries.ts";

export type EnquiryConfig = { mode: EnquiryMode; webhookUrl?: string };
export const deliveryTimeoutMs = 8000;

/** Only called after validation. Replace this adapter when a delivery provider is supplied. */
export async function deliverEnquiry(payload: EnquiryPayload, config: EnquiryConfig, transport: typeof fetch = fetch): Promise<void> {
  if (!config.webhookUrl) throw new Error("Delivery is not configured");
  const destination = new URL(config.webhookUrl);
  if (destination.protocol !== "https:" || destination.username || destination.password) throw new Error("Invalid delivery configuration");
  let property;
  if (payload.intent === "viewing" || payload.intent === "question") {
    const record = getPropertyBySlug(payload.property)!;
    property = { slug: record.slug, title: record.title, area: record.area, priceGBP: record.priceGBP, formattedPrice: formatPrice(record.priceGBP), availability: record.availability };
  }
  const response = await transport(destination.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, ...(property && { propertyContext: property }) }),
    signal: AbortSignal.timeout(deliveryTimeoutMs),
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Delivery failed");
}

/** No persistence or logging. Demo submissions never invoke the delivery adapter. */
export async function submitEnquiry(input: unknown, config: EnquiryConfig, transport: typeof fetch = fetch) {
  const result = validateEnquiry(input);
  if (!result.valid) return { status: 400, body: { ok: false, errors: result.errors, message: "Please check the highlighted fields." } };
  if (config.mode === "demo") return { status: 200, body: { ok: true, mode: "demo", message: previewComplete } };
  try {
    await deliverEnquiry(result.payload, config, transport);
    return { status: 200, body: { ok: true, mode: "live", message: liveSuccess } };
  } catch {
    return { status: 503, body: { ok: false, message: liveError } };
  }
}
