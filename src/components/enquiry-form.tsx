"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "./ui/button";
import { FormField, Input, Select, Textarea } from "./ui/form";
import {
  demoDisclosure, enquiryContent, enquirySubjects, fieldLimits, getEnquirySummary,
  liveError, liveSuccess, previewComplete, sellingTimeframes, validateEnquiry,
  valuationPropertyTypes, viewingTimes, type EnquiryErrors, type EnquiryField,
  type EnquiryIntent, type EnquiryMode,
} from "@/lib/enquiries";

const emptyFields: Record<EnquiryField, string> = { fullName: "", email: "", phone: "", message: "", subject: "", preferredDate: "", preferredTime: "", propertyArea: "", propertyType: "", bedrooms: "", timeframe: "" };
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function EnquiryForm({ intent, property, mode, today }: { intent: EnquiryIntent; property?: string; mode: EnquiryMode; today: string }) {
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const [values, setValues] = useState(emptyFields);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState("");
  const [deliveryError, setDeliveryError] = useState("");
  const [summary, setSummary] = useState<ReturnType<typeof getEnquirySummary>>();
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);

  function update(field: EnquiryField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSummary(undefined);
    setOutcome("");
    setDeliveryError("");
  }

  function showErrors(next: EnquiryErrors) {
    setErrors(next);
    setOutcome("");
    setSummary(undefined);
    const first = [...(formRef.current?.elements || [])].find((element) => element instanceof HTMLElement && next[element.getAttribute("name") as EnquiryField]);
    if (first instanceof HTMLElement) first.focus();
    else requestAnimationFrame(() => errorRef.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const result = validateEnquiry({ ...values, intent, property });
    setDeliveryError("");
    if (!result.valid) { showErrors(result.errors); return; }
    setErrors({});
    setValues((current) => Object.fromEntries(Object.keys(current).map((key) => [key, current[key as EnquiryField].trim()])) as Record<EnquiryField, string>);
    if (mode === "demo") {
      setSummary(getEnquirySummary(result.payload));
      setOutcome(previewComplete);
      return;
    }
    submitting.current = true;
    setPending(true);
    setSummary(undefined);
    setOutcome("Sending enquiry…");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.payload), cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        if (body.errors) showErrors(body.errors);
        else throw new Error("Delivery failed");
      } else if (body.mode === "demo") {
        setSummary(getEnquirySummary(result.payload));
        setOutcome(previewComplete);
      } else if (body.mode === "live") setOutcome(liveSuccess);
      else throw new Error("Unexpected response");
    } catch {
      setOutcome("");
      setDeliveryError(liveError);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const shared = (field: EnquiryField) => ({ id: `enquiry-${field}`, name: field, value: values[field], invalid: !!errors[field], onChange: (event: { target: { value: string } }) => update(field, event.target.value) });

  return <form ref={formRef} className="enquiry-form" aria-label="Enquiry form" aria-busy={pending} noValidate onSubmit={submit}>
    {(Object.values(errors).some(Boolean) || deliveryError) && <div ref={errorRef} className="enquiry-errors" role="alert" tabIndex={-1}>
      <p>{deliveryError || "Please check the highlighted fields."}</p>
      {(errors.intent || errors.property) && <p>{errors.intent || errors.property}</p>}
    </div>}
    <noscript><p>This form needs JavaScript to preview or send an enquiry.</p></noscript>
    <fieldset disabled={pending || !ready}>
      <legend className="enquiry-form-legend">Your enquiry</legend>
      <div className="enquiry-fields">
        <FormField id="enquiry-fullName" label="Full name (required)" error={errors.fullName}>
          <Input {...shared("fullName")} type="text" autoComplete="name" maxLength={fieldLimits.fullName} required />
        </FormField>
        <FormField id="enquiry-email" label="Email address (required)" error={errors.email}>
          <Input {...shared("email")} type="email" autoComplete="email" maxLength={fieldLimits.email} required />
        </FormField>
        <FormField id="enquiry-phone" label="Phone number (optional)" error={errors.phone}>
          <Input {...shared("phone")} type="tel" autoComplete="tel" maxLength={fieldLimits.phone} />
        </FormField>
        {intent === "general" && <FormField id="enquiry-subject" label="Subject (optional)" error={errors.subject}>
          <Select {...shared("subject")}><option value="">No preference</option>{enquirySubjects.map((value) => <option key={value}>{value}</option>)}</Select>
        </FormField>}
        {intent === "viewing" && <>
          <FormField id="enquiry-preferredDate" label="Preferred viewing date (optional)" error={errors.preferredDate}>
            <Input {...shared("preferredDate")} type="date" min={today} aria-describedby="viewing-request-note" />
          </FormField>
          <FormField id="enquiry-preferredTime" label="Preferred time of day (optional)" error={errors.preferredTime}>
            <Select {...shared("preferredTime")} aria-describedby="viewing-request-note"><option value="">No preference</option>{viewingTimes.map((value) => <option key={value}>{value}</option>)}</Select>
          </FormField>
          <p id="viewing-request-note" className="field-hint enquiry-wide">Your preferred time is a request, not a confirmed appointment.</p>
        </>}
        {intent === "valuation" && <>
          <FormField id="enquiry-propertyArea" label="Property area or postcode (required)" error={errors.propertyArea}>
            <Input {...shared("propertyArea")} type="text" autoComplete="off" maxLength={fieldLimits.propertyArea} required />
          </FormField>
          <FormField id="enquiry-propertyType" label="Property type (required)" error={errors.propertyType}>
            <Select {...shared("propertyType")} required><option value="">Choose a type</option>{valuationPropertyTypes.map((value) => <option key={value}>{value}</option>)}</Select>
          </FormField>
          <FormField id="enquiry-bedrooms" label="Bedrooms (optional)" error={errors.bedrooms}>
            <Input {...shared("bedrooms")} type="number" min={0} max={20} step={1} inputMode="numeric" />
          </FormField>
          <FormField id="enquiry-timeframe" label="Selling timeframe (optional)" error={errors.timeframe}>
            <Select {...shared("timeframe")}><option value="">No preference</option>{sellingTimeframes.map((value) => <option key={value}>{value}</option>)}</Select>
          </FormField>
        </>}
        <div className="enquiry-wide">
          <FormField id="enquiry-message" label="Message (required)" error={errors.message}>
            <Textarea {...shared("message")} rows={6} maxLength={fieldLimits.message} required />
          </FormField>
        </div>
      </div>
      <div className="enquiry-submit">
        {mode === "demo" && <p className="field-hint" id="enquiry-demo-disclosure">{demoDisclosure}</p>}
        <Button type="submit" disabled={pending || !ready} aria-describedby={mode === "demo" ? "enquiry-demo-disclosure" : undefined}>{pending ? "Sending enquiry…" : mode === "demo" ? "Preview enquiry" : enquiryContent[intent].action}</Button>
      </div>
    </fieldset>
    <p className="enquiry-outcome" role="status" aria-live="polite" aria-atomic="true">{outcome}</p>
    {summary && <section className="enquiry-preview" aria-labelledby="enquiry-preview-title">
      <h2 id="enquiry-preview-title">Your enquiry preview</h2>
      <dl>{summary.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="field-hint">Edit the form above to update your preview.</p>
    </section>}
  </form>;
}
