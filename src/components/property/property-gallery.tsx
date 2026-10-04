"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { MediaImage } from "@/lib/media";
import { getGalleryIndex } from "@/lib/property-details";
import { Arrow } from "../ui/button";

export function PropertyGallery({ images }: { images: readonly MediaImage[] }) {
  const [index, setIndex] = useState(0);
  const imageId = useId();
  if (!images.length) return <div className="property-gallery"><div className="property-main-image" aria-hidden="true" /></div>;
  const multiple = images.length > 1;
  const image = images[index];
  const move = (direction: -1 | 1) => setIndex((current) => getGalleryIndex(current, images.length, direction));

  return <section className="property-gallery" aria-label="Property photographs" tabIndex={multiple ? 0 : undefined}
    onKeyDown={(event) => {
      if (!multiple || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }}>
    <div className="property-main-image" id={imageId}>
      <Image src={image.src} alt={image.alt} fill priority={index === 0} sizes="(max-width: 639px) 100vw, 90vw" />
    </div>
    {multiple && <div className="property-gallery-controls">
      <button type="button" className="gallery-previous" aria-label="Previous image" aria-controls={imageId} onClick={() => move(-1)}><Arrow /></button>
      <p role="status" aria-live="polite" aria-atomic="true">Image {index + 1} of {images.length}</p>
      <button type="button" aria-label="Next image" aria-controls={imageId} onClick={() => move(1)}><Arrow /></button>
    </div>}
  </section>;
}
