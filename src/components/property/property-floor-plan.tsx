import Image from "next/image";
import type { FloorPlanAsset } from "@/lib/media";

export function PropertyFloorPlan({ asset }: { asset: FloorPlanAsset | null }) {
  if (!asset?.src.trim() || !asset.label.trim() || !asset.format.trim() || (asset.kind === "image" && !asset.alt.trim())) return null;
  return <section className="property-floor-plan" aria-labelledby="property-floor-plan-title">
    <h2 id="property-floor-plan-title">Floor plan</h2>
    {asset.kind === "image" ? <div className="property-floor-plan-image">
      <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 1023px) 90vw, 60vw" />
    </div> : <object className="property-floor-plan-document" data={asset.src} type="application/pdf" aria-label={asset.label}>
      <p>Open the floor plan using the file link below.</p>
    </object>}
    <a className="text-link" href={asset.src} target="_blank" rel="noopener noreferrer">Open {asset.label} ({asset.format})<span className="sr-only"> in a new tab</span></a>
  </section>;
}
