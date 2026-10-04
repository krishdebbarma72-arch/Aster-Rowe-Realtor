import Link from "next/link";
import { formatPropertyCount, getNeighbourhoods } from "@/lib/neighbourhoods";
import { Arrow } from "./ui/button";
import { Container } from "./ui/container";
import { SectionHeading } from "./ui/section-heading";

export function NeighbourhoodsSection() {
  const neighbourhoods = getNeighbourhoods();
  if (!neighbourhoods.length) return null;

  return <section className="neighbourhoods-section" aria-labelledby="neighbourhoods-title">
    <Container className="neighbourhoods-layout">
      <div className="neighbourhoods-introduction">
        <SectionHeading id="neighbourhoods-title" as="h2" eyebrow="EXPLORE BY NEIGHBOURHOOD" title="Find your corner of London.">
          <p>Choose an area to explore the homes listed there.</p>
        </SectionHeading>
        <Link href="/properties" className="text-link">Explore all properties</Link>
      </div>
      <ol className="neighbourhoods-list" role="list">
        {neighbourhoods.map(({ area, count, href }, index) => <li key={area}>
          <Link href={href} className="neighbourhood-row" aria-label={`Explore properties in ${area} — ${formatPropertyCount(count)}`}>
            <span className="neighbourhood-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="neighbourhood-name">{area}</span>
            <span className="neighbourhood-count">{formatPropertyCount(count)}</span>
            <Arrow className="neighbourhood-arrow" />
          </Link>
        </li>)}
      </ol>
    </Container>
  </section>;
}
