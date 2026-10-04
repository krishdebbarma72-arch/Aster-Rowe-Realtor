import { ButtonLink } from "./ui/button";
import { Container } from "./ui/container";
import { SectionHeading } from "./ui/section-heading";

type ContactAction = { href: string; label: string };
type ClosingContactProps = {
  id?: string;
  className?: string;
  eyebrow?: string | null;
  title?: string;
  description?: string;
  primaryAction?: ContactAction;
  secondaryAction?: ContactAction | null;
};

export function ClosingContactSection({
  id = "closing-contact-title",
  className = "closing-contact-section",
  eyebrow = "YOUR NEXT MOVE",
  title = "Let’s talk about your next move.",
  description = "Looking for a home or planning a sale? Tell us what matters to you.",
  primaryAction = { href: "/contact", label: "Start a conversation" },
  secondaryAction = { href: "/sell", label: "Request a valuation" },
}: ClosingContactProps = {}) {
  return <section className={className} aria-labelledby={id}>
    <Container className="closing-contact-layout">
      <SectionHeading id={id} as="h2" eyebrow={eyebrow || undefined} title={title}>
        <p>{description}</p>
      </SectionHeading>
      <div className="closing-contact-actions">
        <ButtonLink href={primaryAction.href} className="closing-contact-primary">{primaryAction.label}</ButtonLink>
        {secondaryAction && <ButtonLink href={secondaryAction.href} variant="secondary" className="closing-contact-secondary">{secondaryAction.label}</ButtonLink>}
      </div>
    </Container>
  </section>;
}
