import "server-only";
import type { EnquiryMode } from "../enquiries.ts";

export function getEnquiryConfig(): { mode: EnquiryMode; webhookUrl?: string } {
  return {
    mode: process.env.ENQUIRY_MODE === "live" ? "live" : "demo",
    webhookUrl: process.env.ENQUIRY_WEBHOOK_URL,
  };
}
