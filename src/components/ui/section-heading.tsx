import type { ReactNode } from "react";

export function SectionHeading({ id, eyebrow, title, children, as: Heading = "h1" }:
  { id?: string; eyebrow?: string; title: ReactNode; children?: ReactNode; as?: "h1" | "h2" | "h3" }) {
  return <div className="section-heading">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <Heading id={id} className="page-title">{title}</Heading>
    {children && <div className="section-description">{children}</div>}
  </div>;
}
