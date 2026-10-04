import Link from "next/link";

export function Wordmark() {
  return <Link className="wordmark" href="/" aria-label="Aster & Rowe — home">Aster <span>&amp;</span> Rowe<span className="wordmark-dot" aria-hidden="true">.</span></Link>;
}
