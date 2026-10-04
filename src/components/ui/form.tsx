import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export function FormField({ id, label, hint, error, children }:
  { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return <div className="form-field">
    <label htmlFor={id}>{label}</label>
    {children}
    {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
  </div>;
}

type FieldState = { id: string; hasHint?: boolean; invalid?: boolean };
function describedBy(id: string, hasHint?: boolean, invalid?: boolean, extra?: string) {
  return [hasHint && `${id}-hint`, invalid && `${id}-error`, extra].filter(Boolean).join(" ") || undefined;
}

export function Input({ id, hasHint, invalid, className = "", "aria-describedby": description, ...props }:
  InputHTMLAttributes<HTMLInputElement> & FieldState) {
  return <input id={id} className={`form-control ${className}`} aria-invalid={invalid || undefined}
    aria-describedby={describedBy(id, hasHint, invalid, description)} {...props} />;
}

export function Select({ id, hasHint, invalid, className = "", "aria-describedby": description, ...props }:
  SelectHTMLAttributes<HTMLSelectElement> & FieldState) {
  return <select id={id} className={`form-control ${className}`} aria-invalid={invalid || undefined}
    aria-describedby={describedBy(id, hasHint, invalid, description)} {...props} />;
}

export function Textarea({ id, hasHint, invalid, className = "", "aria-describedby": description, ...props }:
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldState) {
  return <textarea id={id} className={`form-control ${className}`} aria-invalid={invalid || undefined}
    aria-describedby={describedBy(id, hasHint, invalid, description)} {...props} />;
}
