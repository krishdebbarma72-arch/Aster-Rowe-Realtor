import Image from "next/image";
import { sellerSectionMedia } from "@/lib/media";
import { ButtonLink } from "./ui/button";
import { Container } from "./ui/container";
import { SectionHeading } from "./ui/section-heading";

const explanations = [
  {
    number: "01",
    title: "A valuation with context",
    description: "Discuss your home’s features and the factors that could influence its asking price.",
  },
  {
    number: "02",
    title: "A plan for presenting your home",
    description: "Consider the photographs and property details that will help buyers understand the space.",
  },
  {
    number: "03",
    title: "A clear next step",
    description: "Talk through your timing and priorities before deciding how to proceed.",
  },
] as const;

export function SellerSection() {
  const image = sellerSectionMedia.image;
  const hasImage = Boolean(image?.src.trim());

  return <section className="seller-section" aria-labelledby="seller-title">
    <Container className="seller-layout">
      <div className="seller-content">
        <SectionHeading id="seller-title" as="h2" eyebrow="THINKING OF SELLING?" title="Start with a clearer picture of your home.">
          <p>Explore what could influence your asking price, how to present your property, and the steps involved in bringing it to market.</p>
        </SectionHeading>
        <ol className="seller-explanations" role="list">
          {explanations.map(({ number, title, description }) => <li className="seller-row" key={number}>
            <span className="seller-row-number" aria-hidden="true">{number}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
          </li>)}
        </ol>
        <div className="seller-action">
          <ButtonLink href="/sell">Request a valuation</ButtonLink>
          <p>Tell us about your home and the move you have in mind.</p>
        </div>
      </div>
      <div className="seller-media" aria-hidden={!hasImage || undefined}>
        {hasImage && image && <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1023px) 100vw, 50vw" />}
      </div>
    </Container>
  </section>;
}
