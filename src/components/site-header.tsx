"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { navigation, valuationInquiryHref } from "@/lib/navigation";
import { ButtonLink } from "./ui/button";
import { Container } from "./ui/container";
import { Wordmark } from "./wordmark";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
const isScrolled = () => window.scrollY >= 80;
const serverScrolled = () => false;

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, serverScrolled);
  const overlay = pathname === "/" && !scrolled;
  const valuationHref = pathname === "/sell" ? valuationInquiryHref : "/sell";
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    dialog.showModal();
    const menuButton = menuRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      menuButton?.focus({ preventScroll: true });
    };
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return <header className={`site-header ${overlay ? "site-header--overlay" : ""}`}>
    <Container className="header-inner">
      <Wordmark />
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(({ href, label }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>{label}</Link>)}
      </nav>
      <ButtonLink href={valuationHref} className="header-valuation">Request a valuation</ButtonLink>
      <button ref={menuRef} type="button" className="menu-toggle" aria-expanded={open}
        aria-controls="mobile-menu" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <span>Menu</span><span className="menu-lines" aria-hidden="true"><span /><span /></span>
      </button>
    </Container>
    <dialog ref={dialogRef} id="mobile-menu" className="mobile-menu" aria-label="Navigation menu"
      onCancel={(event) => { event.preventDefault(); setOpen(false); }}>
      <Container className="mobile-menu-inner">
        <div className="mobile-menu-top">
          <div onClick={() => setOpen(false)}><Wordmark /></div>
          <button type="button" className="menu-toggle" autoFocus onClick={() => setOpen(false)}>Close <span aria-hidden="true">×</span></button>
        </div>
        <nav aria-label="Mobile navigation">
          {navigation.map(({ href, label }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
        <ButtonLink href={valuationHref} onClick={() => setOpen(false)}>Request a valuation</ButtonLink>
        <p className="mobile-demo">Aster &amp; Rowe · Demonstration website</p>
      </Container>
    </dialog>
  </header>;
}
