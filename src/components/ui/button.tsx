import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";
const styles = (variant: Variant, className: string) => `button button--${variant} ${className}`;

export function Button({ variant = "primary", className = "", type = "button", ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={styles(variant, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className = "", ...props }:
  ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={styles(variant, className)} {...props} />;
}

export function Arrow({ className = "" }: { className?: string }) {
  return <svg className={`arrow ${className}`} aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>;
}
