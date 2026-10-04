"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { heroMedia } from "@/lib/media";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const reducedMotion = () => window.matchMedia(motionQuery).matches;
const serverReducedMotion = () => true;

export function HeroMedia() {
  const reduceMotion = useSyncExternalStore(subscribeMotion, reducedMotion, serverReducedMotion);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const videoSrc = heroMedia.videoSrc?.trim();
  const poster = heroMedia.posterImage?.src.trim() ? heroMedia.posterImage : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    void video.play().catch(() => { /* Poster remains visible if autoplay is blocked. */ });
  }, [reduceMotion, videoSrc]);

  const hasMedia = Boolean(videoSrc || poster);
  return <>
    <div className={`hero-media ${hasMedia ? "hero-media--populated" : ""}`} aria-hidden="true">
      {poster && <Image src={poster.src} alt="" fill priority sizes="100vw" />}
      {videoSrc && !reduceMotion && <video ref={videoRef} src={videoSrc} poster={poster?.src}
        muted playsInline loop autoPlay preload="metadata" tabIndex={-1}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
    </div>
    {videoSrc && !reduceMotion && <button type="button" className="video-control" aria-label={playing ? "Pause background video" : "Play background video"}
      onClick={() => { const video = videoRef.current; if (!video) return; if (video.paused) void video.play().catch(() => {}); else video.pause(); }}>
      {playing ? "Pause video" : "Play video"}
    </button>}
  </>;
}
