import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { ClosingContactSection } from "@/components/closing-contact-section";
import { valuationInquiryHref } from "@/lib/navigation";

export const metadata: Metadata = { title: "About", description: "Clear details, thoughtful presentation, and your priorities: the approach behind Aster & Rowe, a fictional London agency demonstration website." };

const principles = [
  { title: "Clarity from the start", description: "Property details and practical information presented clearly, so you can understand your options." },
  { title: "Attention to each home", description: "A focus on the features, spaces, and details that help people understand a property." },
  { title: "Your priorities in view", description: "Conversations that begin with what you are looking for and the timing you have in mind." },
];

export default function AboutPage() {
  return <>
    <Container className="page-section about-introduction">
      <SectionHeading eyebrow="ABOUT ASTER & ROWE" title="Clarity for your next move.">
        <p>Property decisions begin with understanding your options. Our approach brings clear details, thoughtful presentation, and your priorities into focus.</p>
      </SectionHeading>
      <div className="about-actions"><ButtonLink href="/contact">Start a conversation</ButtonLink></div>
    </Container>

    <section className="seller-section" aria-labelledby="about-approach-title">
      <Container className="seller-layout about-approach-layout">
        <div className="seller-content">
          <SectionHeading id="about-approach-title" as="h2" title="Our approach to property.">
            <p>Clear information, thoughtful presentation, and space to decide what comes next.</p>
          </SectionHeading>
        </div>
        <ol className="seller-explanations about-principles" role="list">
          {principles.map(({ title, description }, index) => <li key={title} className="seller-row">
            <span className="seller-row-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
          </li>)}
        </ol>
      </Container>
    </section>

    <Container className="page-section about-pathways">
      <section className="about-pathway" aria-labelledby="about-buyers-title">
        <div className="seller-content">
          <SectionHeading id="about-buyers-title" as="h2" eyebrow="FOR BUYERS" title="Explore your next home.">
            <p>Browse properties, compare the details, and request a viewing when a home interests you.</p>
          </SectionHeading>
          <div className="about-actions"><ButtonLink href="/properties">Explore properties</ButtonLink></div>
        </div>
      </section>
      <section className="about-pathway" aria-labelledby="about-sellers-title">
        <div className="seller-content">
          <SectionHeading id="about-sellers-title" as="h2" eyebrow="FOR SELLERS" title="Consider your next move.">
            <p>Explore the selling process and start a conversation about your property.</p>
          </SectionHeading>
          <div className="about-actions">
            <ButtonLink href="/sell">Explore selling with us</ButtonLink>
            <Link href={valuationInquiryHref} className="text-link">Request a valuation</Link>
          </div>
        </div>
      </section>
    </Container>

    <ClosingContactSection id="about-closing-title" className="about-closing-section" eyebrow={null}
      title="Let’s discuss what comes next."
      description="Tell us whether you are looking for a home, considering a sale, or have a question."
      secondaryAction={null} />
  </>;
}
