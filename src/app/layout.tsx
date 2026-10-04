import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-heading", display: "swap", fallback: ["Georgia", "Times New Roman", "serif"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap", fallback: ["Arial", "Helvetica", "sans-serif"] });

export const metadata: Metadata = {
  title: { default: "Aster & Rowe | Find your place in London — demonstration website", template: "%s | Aster & Rowe" },
  description: "Explore London homes, compare property details, and plan your next move. Aster & Rowe is a fictional agency demonstration website.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB" className={`${serif.variable} ${sans.variable}`}>
    <body id="page-top" tabIndex={-1}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </body>
  </html>;
}
