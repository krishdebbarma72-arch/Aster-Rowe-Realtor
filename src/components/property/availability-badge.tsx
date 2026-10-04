import type { Availability } from "@/lib/properties";

export function AvailabilityBadge({ status }: { status: Availability }) {
  return <span className={`availability-badge ${status === "For sale" ? "availability-badge--available" : ""}`}>{status}</span>;
}
