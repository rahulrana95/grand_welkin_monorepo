"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DESTINATIONS } from "@/lib/data";
import { Combobox, type ComboboxOption } from "./Combobox";
import { DateRangeField } from "./DateRangeField";
import { GuestsField } from "./GuestsField";

/**
 * Emotional, low-commitment search (Wander's "Whenever / Whoever" pattern — docs 01).
 * The "Where" field is a themed type-to-filter combobox; picking a destination routes
 * to its page. Responsive: collapses to a single column on small screens.
 */
const DESTINATION_OPTIONS: readonly ComboboxOption[] = DESTINATIONS.map((d) => ({
  value: d.slug,
  label: d.name,
  hint: d.country,
}));

export function SearchBar() {
  const router = useRouter();
  const [where, setWhere] = useState("");
  const [range, setRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [guests, setGuests] = useState(2);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    if (guests > 0) params.set("guests", String(guests));
    const qs = params.toString() ? `?${params.toString()}` : "";
    router.push(`${where ? `/destinations/${where}` : "/explore"}${qs}`);
  };

  return (
    <form className="wb-search" role="search" aria-label="Find a stay" onSubmit={onSubmit}>
      <Field label="Where to">
        <Combobox
          name="where"
          ariaLabel="Where to"
          placeholder="Anywhere serene…"
          options={DESTINATION_OPTIONS}
          onSelect={setWhere}
        />
      </Field>
      <Field label="Whenever">
        <DateRangeField
          nameFrom="from"
          nameTo="to"
          ariaLabel="Check-in and check-out dates"
          onChange={(from, to) => setRange({ from, to })}
        />
      </Field>
      <Field label="Who's coming">
        <GuestsField ariaLabel="Guests" onChange={setGuests} />
      </Field>
      <button type="submit" className="btn btn--primary wb-search__submit">
        Explore
      </button>
    </form>
  );
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div className="wb-search__field">
      <span className="eyebrow" style={{ fontSize: "0.68rem" }}>{label}</span>
      {children}
    </div>
  );
}
