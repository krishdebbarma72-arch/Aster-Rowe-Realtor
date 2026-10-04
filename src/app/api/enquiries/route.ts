import { getEnquiryConfig } from "../../../lib/server/enquiry-config.ts";
import { submitEnquiry } from "../../../lib/server/enquiry-delivery.ts";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ ok: false, message: "Use a valid enquiry request." }, { status: 415, headers });
  try {
    const body = await request.text();
    if (body.length > 24000) return Response.json({ ok: false, message: "Your enquiry is too long." }, { status: 413, headers });
    const result = await submitEnquiry(JSON.parse(body), getEnquiryConfig());
    return Response.json(result.body, { status: result.status, headers });
  } catch {
    return Response.json({ ok: false, message: "Use a valid enquiry request." }, { status: 400, headers });
  }
}
