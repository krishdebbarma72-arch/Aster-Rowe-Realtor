export const navigation = [
  { href: "/properties", label: "Properties" },
  { href: "/sell", label: "Sell with us" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const demoDisclosure =
  "Demonstration website. Aster & Rowe is a fictional agency; all property listings are illustrative.";

export const valuationInquiryHref = `/contact?${new URLSearchParams({ intent: "valuation" }).toString()}`;
