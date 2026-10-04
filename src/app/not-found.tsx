import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return <Container className="page-section minimal-page"><SectionHeading eyebrow="PAGE NOT FOUND" title="We couldn’t find that page."><p>Browse the illustrative homes or return to the homepage.</p></SectionHeading><ButtonLink href="/properties">View all properties</ButtonLink></Container>;
}
