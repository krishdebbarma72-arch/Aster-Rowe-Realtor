/** Map supplied, authorised assets here. Null slots never render media elements. */
export interface MediaImage {
  src: string;
  alt: string;
}

export interface PropertyMedia {
  mainImage: MediaImage | null;
  gallery: readonly MediaImage[];
  floorPlan: FloorPlanAsset | null;
}

export type FloorPlanAsset =
  | { kind: "image"; src: string; alt: string; label: string; format: string }
  | { kind: "pdf"; src: string; label: string; format: string };

export const heroMedia: { videoSrc: string | null; posterImage: MediaImage | null } = {
  videoSrc: null,
  posterImage: null,
};

/** Supplied image for the homepage seller section. */
export const sellerSectionMedia: { image: MediaImage | null } = {
  image: null,
};

/** Stable property IDs map to supplied photographs and an optional floor plan. */
export const propertyMedia: Record<string, PropertyMedia> = {
  "ar-001": { mainImage: null, gallery: [], floorPlan: null },
  "ar-002": { mainImage: null, gallery: [], floorPlan: null },
  "ar-003": { mainImage: null, gallery: [], floorPlan: null },
  "ar-004": { mainImage: null, gallery: [], floorPlan: null },
  "ar-005": { mainImage: null, gallery: [], floorPlan: null },
  "ar-006": { mainImage: null, gallery: [], floorPlan: null },
};
