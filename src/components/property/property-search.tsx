"use client";

import { useEffect, useRef } from "react";
import Form from "next/form";
import { bedroomMinimums, searchParameterNames, locations, maxPrices, propertyTypes, sortOptions, type PropertyFilters, type PropertySort } from "@/lib/property-search";
import { formatPrice } from "@/lib/properties";
import { Button, Arrow } from "../ui/button";
import { FormField, Select } from "../ui/form";

export function PropertySearch({ mode = "hero", filters = {}, sort }: { mode?: "hero" | "listings"; filters?: PropertyFilters; sort?: PropertySort }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    // Preserve native GET submission, including Enter, while omitting defaults.
    const removeDefaults = (event: FormDataEvent) => {
      for (const name of searchParameterNames) {
        if (event.formData.get(name) === "") event.formData.delete(name);
      }
    };
    form.addEventListener("formdata", removeDefaults);
    return () => form.removeEventListener("formdata", removeDefaults);
  }, []);

  const fields = <>
    <FormField id="search-location" label="Location">
      <Select id="search-location" name="location" defaultValue={filters.location ?? ""}>
        <option value="">All London</option>
        {locations.map((location) => <option key={location} value={location}>{location}</option>)}
      </Select>
    </FormField>
    <FormField id="search-type" label="Property type">
      <Select id="search-type" name="propertyType" defaultValue={filters.propertyType ?? ""}>
        <option value="">Any type</option>
        {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </Select>
    </FormField>
    <FormField id="search-price" label="Maximum price">
      <Select id="search-price" name="maxPrice" defaultValue={filters.maxPrice === undefined ? "" : String(filters.maxPrice)}>
        <option value="">Any price</option>
        {maxPrices.map((price) => <option key={price} value={price}>{formatPrice(price)}</option>)}
      </Select>
    </FormField>
    <FormField id="search-bedrooms" label="Bedrooms">
      <Select id="search-bedrooms" name="minBedrooms" defaultValue={filters.minBedrooms === undefined ? "" : String(filters.minBedrooms)}>
        <option value="">Any</option>
        {bedroomMinimums.map((count) => <option key={count} value={count}>{count}+</option>)}
      </Select>
    </FormField>
    {mode === "listings" && <FormField id="search-sort" label="Sort by">
      <Select id="search-sort" name="sort" defaultValue={sort ?? ""}>
        <option value="">Default order</option>
        {sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </Select>
    </FormField>}
    <Button type="submit">{mode === "listings" ? "Apply filters" : "Search properties"} <Arrow /></Button>
  </>;
  // Next's GET form uses route navigation, so the query-keyed controls remount
  // from server values on Back/Forward instead of retaining a native form draft.
  return mode === "listings"
    ? <Form ref={formRef} action="/properties" className="property-search listings-search" aria-label="Filter and sort properties">{fields}</Form>
    : <form ref={formRef} action="/properties" method="get" className="property-search" aria-label="Search properties for sale">{fields}</form>;
}
