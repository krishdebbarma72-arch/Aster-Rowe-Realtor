import { getPropertyBySlug, formatPrice, type Property } from "./properties.ts";
import { propertyTypes, type QueryParameters } from "./property-search.ts";

export const enquiryIntents = ["general", "viewing", "question", "valuation"] as const;
export type EnquiryIntent = typeof enquiryIntents[number];
export type EnquiryMode = "demo" | "live";
export const enquiryContent = {
  general: { heading: "Your next move starts here.", description: "Tell us what you are looking for or what you would like to discuss.", action: "Send enquiry" },
  viewing: { heading: "Request a viewing.", description: "Share your preferred timing and any questions about this home.", action: "Request a viewing" },
  question: { heading: "Ask about this home.", description: "Tell us what you would like to know about the property.", action: "Send enquiry" },
  valuation: { heading: "Tell us about your property.", description: "Share a few details about your home and when you are considering a move.", action: "Request a valuation" },
} as const;
export const viewingTimes = ["Morning", "Afternoon", "Evening"] as const;
export const sellingTimeframes = ["Exploring options", "Within 3 months", "Within 6 months", "Later"] as const;
export const enquirySubjects = ["Buying a property", "Selling a property", "Other question"] as const;
export const valuationPropertyTypes = [...propertyTypes, "Other"];
export const fieldLimits = { fullName: 120, email: 254, phone: 50, message: 5000, propertyArea: 120 } as const;
export const demoDisclosure = "Demo form. Your details will not be sent or stored.";
export const previewComplete = "Preview complete. No enquiry has been sent.";
export const liveSuccess = "Your enquiry has been sent.";
export const liveError = "We couldn’t send your enquiry. Please try again.";

type CommonEnquiry = { fullName: string; email: string; phone?: string; message: string };
export type EnquiryPayload = CommonEnquiry & (
  | { intent: "general"; subject?: typeof enquirySubjects[number] }
  | { intent: "viewing"; property: string; preferredDate?: string; preferredTime?: typeof viewingTimes[number] }
  | { intent: "question"; property: string }
  | { intent: "valuation"; propertyArea: string; propertyType: string; bedrooms?: number; timeframe?: typeof sellingTimeframes[number] }
);
export type EnquiryField = "fullName" | "email" | "phone" | "message" | "subject" | "preferredDate" | "preferredTime" | "propertyArea" | "propertyType" | "bedrooms" | "timeframe";
export type EnquiryErrors = Partial<Record<EnquiryField | "intent" | "property", string>>;
export type EnquiryContext = { intent: EnquiryIntent; property?: Property };

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
export function resolveEnquiryContext(query: QueryParameters): EnquiryContext {
  const requested = first(query.intent);
  const intent = enquiryIntents.includes(requested as EnquiryIntent) ? requested as EnquiryIntent : "general";
  if (intent !== "viewing" && intent !== "question") return { intent };
  const slug = first(query.property);
  const property = slug ? getPropertyBySlug(slug) : undefined;
  if (!property) return { intent: "general" };
  return { intent: intent === "viewing" && property.availability !== "For sale" ? "question" : intent, property };
}

export function getToday(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function validateEnquiry(input: unknown, today = getToday()): { valid: true; payload: EnquiryPayload } | { valid: false; errors: EnquiryErrors } {
  const data = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const errors: EnquiryErrors = {};
  const text = (field: EnquiryField, label: string, required = false, limit = 120) => {
    const raw = data[field];
    const value = typeof raw === "string" ? raw.trim() : "";
    if (raw !== undefined && typeof raw !== "string") errors[field] = `Enter a valid ${label.toLowerCase()}.`;
    else if (required && !value) errors[field] = `${label} is required.`;
    else if (value.length > limit) errors[field] = `Use ${limit} characters or fewer for ${label.toLowerCase()}.`;
    return value;
  };
  const option = <T extends string>(field: EnquiryField, label: string, options: readonly T[], required = false) => {
    const value = text(field, label, required);
    if (value && !options.includes(value as T)) errors[field] = `Choose a valid ${label.toLowerCase()}.`;
    return value as T | "";
  };
  const requested = data.intent;
  if (typeof requested !== "string" || !enquiryIntents.includes(requested as EnquiryIntent)) errors.intent = "Choose a supported enquiry type.";
  const context = resolveEnquiryContext({ intent: typeof requested === "string" ? requested : undefined, property: typeof data.property === "string" ? data.property : undefined });
  if ((requested === "viewing" || requested === "question") && !context.property) errors.property = "Choose an existing property or start a general enquiry.";
  const fullName = text("fullName", "Full name", true, fieldLimits.fullName);
  const email = text("email", "Email address", true, fieldLimits.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  const phone = text("phone", "Phone number", false, fieldLimits.phone);
  const message = text("message", "Message", true, fieldLimits.message);
  const common = { fullName, email, ...(phone && { phone }), message };
  let payload: EnquiryPayload;
  if (context.intent === "valuation") {
    const propertyArea = text("propertyArea", "Property area or postcode", true, fieldLimits.propertyArea);
    const propertyType = option("propertyType", "Property type", valuationPropertyTypes, true);
    const timeframe = option("timeframe", "Selling timeframe", sellingTimeframes);
    const bedrooms = data.bedrooms;
    let bedroomCount: number | undefined;
    if (bedrooms !== undefined && bedrooms !== "") {
      const value = typeof bedrooms === "string" ? bedrooms.trim() : bedrooms;
      if ((typeof value !== "number" && (typeof value !== "string" || !/^\d{1,2}$/.test(value))) || !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 20) errors.bedrooms = "Enter a whole number from 0 to 20.";
      else bedroomCount = Number(value);
    }
    payload = { ...common, intent: "valuation", propertyArea, propertyType, ...(bedroomCount !== undefined && { bedrooms: bedroomCount }), ...(timeframe && { timeframe }) };
  } else if (context.intent === "viewing") {
    const preferredDate = text("preferredDate", "Preferred viewing date");
    if (preferredDate) {
      const parsed = new Date(`${preferredDate}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== preferredDate) errors.preferredDate = "Enter a valid date.";
      else if (preferredDate < today) errors.preferredDate = "Choose today or a future date.";
    }
    const preferredTime = option("preferredTime", "Preferred time of day", viewingTimes);
    payload = { ...common, intent: "viewing", property: context.property!.slug, ...(preferredDate && { preferredDate }), ...(preferredTime && { preferredTime }) };
  } else if (context.intent === "question") {
    payload = { ...common, intent: "question", property: context.property!.slug };
  } else {
    const subject = option("subject", "Subject", enquirySubjects);
    payload = { ...common, intent: "general", ...(subject && { subject }) };
  }
  return Object.keys(errors).length ? { valid: false, errors } : { valid: true, payload };
}

export function getEnquirySummary(payload: EnquiryPayload): { label: string; value: string }[] {
  const intentLabels = { general: "General enquiry", viewing: "Viewing request", question: "Property question", valuation: "Valuation request" };
  const rows = [
    { label: "Enquiry type", value: intentLabels[payload.intent] },
    { label: "Full name", value: payload.fullName },
    { label: "Email address", value: payload.email },
  ];
  if (payload.phone) rows.push({ label: "Phone number", value: payload.phone });
  if (payload.intent === "viewing" || payload.intent === "question") {
    const property = getPropertyBySlug(payload.property)!;
    rows.push({ label: "Property", value: `${property.title} · ${property.area} · ${formatPrice(property.priceGBP)}` });
    if (payload.intent === "viewing") {
      if (payload.preferredDate) rows.push({ label: "Preferred viewing date", value: payload.preferredDate });
      rows.push({ label: "Preferred time of day", value: payload.preferredTime || "No preference" });
    }
  } else if (payload.intent === "valuation") {
    rows.push({ label: "Property area or postcode", value: payload.propertyArea }, { label: "Property type", value: payload.propertyType });
    if (payload.bedrooms !== undefined) rows.push({ label: "Bedrooms", value: String(payload.bedrooms) });
    if (payload.timeframe) rows.push({ label: "Selling timeframe", value: payload.timeframe });
  } else if (payload.subject) rows.push({ label: "Subject", value: payload.subject });
  rows.push({ label: "Message", value: payload.message });
  return rows;
}
