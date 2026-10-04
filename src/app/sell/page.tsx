import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { valuationInquiryHref } from "@/lib/navigation";

export const metadata: Metadata = { title: "Sell with us", description: "Explore the selling process and plan your next step with Aster & Rowe, a fictional London agency demonstration website." };

const sellingSteps = [
  { title: "Start with your property", description: "Share the details of your home, your circumstances, and the timing you have in mind." },
  { title: "Discuss value and presentation", description: "Consider an asking price and how to present the property clearly to prospective buyers." },
  { title: "Bring your home to market", description: "Agree the property details, prepare the marketing, and arrange opportunities for buyers to view." },
  { title: "Consider your next step", description: "Discuss interest and offers, then decide how you would like to proceed." },
];

const valuationPreparation = [
  "Property location and type.",
  "Number of bedrooms.",
  "Any outdoor space or parking.",
  "Recent changes or improvements.",
  "Your preferred timing.",
];

export default function SellPage() {
  return <>
    <Container className="page-section seller-page-introduction">
      <SectionHeading eyebrow="SELL WITH US" title="A clearer start to selling your home.">
        <p>Understand the process, discuss your property, and plan the next step around your priorities.</p>
      </SectionHeading>
      <div className="seller-page-actions">
        <ButtonLink href={valuationInquiryHref}>Request a valuation</ButtonLink>
        <a href="#selling-process" className="text-link">How selling works</a>
      </div>
    </Container>

    <section id="selling-process" className="seller-page-process seller-page-content" aria-labelledby="selling-process-title">
      <Container className="page-section">
        <SectionHeading id="selling-process-title" as="h2" title="How selling works">
          <p>Understand the stages, from your first conversation to planning the next move.</p>
        </SectionHeading>
        <ol className="selling-steps" role="list">
          {sellingSteps.map(({ title, description }, index) => <li key={title} className="seller-row">
            <span className="seller-row-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
          </li>)}
        </ol>
      </Container>
    </section>

    <section className="seller-section seller-page-content" aria-labelledby="valuation-preparation-title">
      <Container className="seller-layout seller-preparation">
        <SectionHeading id="valuation-preparation-title" as="h2" title="Before the first conversation">
          <p>A few details about your property and timing can help shape the discussion.</p>
        </SectionHeading>
        <div>
          <ul className="valuation-preparation-list">
            {valuationPreparation.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="valuation-preparation-note">You can start a conversation even if you are still exploring your options.</p>
        </div>
      </Container>
    </section>

    <section className="seller-page-closing seller-page-content" aria-labelledby="seller-closing-title">
      <Container className="page-section closing-contact-layout">
        <SectionHeading id="seller-closing-title" as="h2" title="Tell us about your home.">
          <p>Share the property details and timing you have in mind.</p>
        </SectionHeading>
        <div className="seller-page-actions seller-page-closing-actions">
          <ButtonLink href={valuationInquiryHref}>Request a valuation</ButtonLink>
          <Link href="/contact" className="text-link">Have another question?</Link>
        </div>
      </Container>
    </section>
  </>;
}
