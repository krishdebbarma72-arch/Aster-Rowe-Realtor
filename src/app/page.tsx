import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Arrow } from "@/components/ui/button";
import { HeroMedia } from "@/components/hero-media";
import { PropertySearch } from "@/components/property/property-search";
import { FeaturedProperties } from "@/components/property/featured-properties";
import { SellerSection } from "@/components/seller-section";
import { NeighbourhoodsSection } from "@/components/neighbourhoods-section";
import { ClosingContactSection } from "@/components/closing-contact-section";

export default function HomePage() {
  return <><section className="home-hero" aria-labelledby="hero-title">
    <HeroMedia />
    <Container className="hero-content">
      <div className="hero-intro">
        <p className="eyebrow">LONDON HOMES. YOUR NEXT MOVE.</p>
        <h1 id="hero-title">Find your place <em>in London.</em></h1>
        <p className="hero-description">Explore homes across London, compare the details, and take a closer look at the properties that interest you.</p>
        <Link href="/sell" className="hero-selling-link">Selling your home? Start with a valuation <Arrow /></Link>
      </div>
      <PropertySearch />
    </Container>
  </section>
    <FeaturedProperties />
    <SellerSection />
    <NeighbourhoodsSection />
    <ClosingContactSection />
  </>;
}
