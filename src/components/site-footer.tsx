import Link from "next/link";
import { demoDisclosure, navigation } from "@/lib/navigation";
import { Container } from "./ui/container";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return <footer className="site-footer">
    <Container>
      <div className="footer-main">
        <div className="footer-brand"><Wordmark /><p>A considered approach to buying and selling in London.</p></div>
        <div className="footer-navigation">
          <h2 id="footer-explore-title">Explore</h2>
          <nav aria-labelledby="footer-explore-title">{navigation.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}</nav>
        </div>
      </div>
      <div className="footer-bottom"><p>{demoDisclosure}</p><a href="#page-top" className="text-link">Back to top</a></div>
    </Container>
  </footer>;
}
