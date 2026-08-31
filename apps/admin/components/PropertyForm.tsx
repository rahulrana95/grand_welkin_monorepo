import { AMENITIES } from "@welkinbliss/db";
import type { AdminProperty } from "@/lib/repo";

interface PropertyFormProps {
  readonly action: (formData: FormData) => void | Promise<void>;
  readonly property?: AdminProperty;
  readonly submitLabel: string;
}

/** Shared create/edit form. Uncontrolled inputs → posted to a server action. */
export function PropertyForm({ action, property, submitLabel }: PropertyFormProps) {
  const p = property;
  const selected = new Set(p?.amenityKeys ?? []);
  return (
    <form action={action} className="card stack">
      {p ? <input type="hidden" name="id" value={p.id} /> : null}

      <div className="grid2">
        <Field label="Name"><input className="input" name="name" defaultValue={p?.name ?? ""} required /></Field>
        <Field label="Slug"><input className="input" name="slug" defaultValue={p?.slug ?? ""} placeholder="villa-serena" /></Field>
      </div>

      <div className="grid2">
        <Field label="Destination slug"><input className="input" name="destinationSlug" defaultValue={p?.destinationSlug ?? ""} placeholder="amalfi-coast" /></Field>
        <Field label="Status">
          <select className="select" name="status" defaultValue={p?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </div>

      <div className="grid2">
        <Field label="Region"><input className="input" name="region" defaultValue={p?.region ?? ""} /></Field>
        <Field label="Country"><input className="input" name="country" defaultValue={p?.country ?? ""} /></Field>
        <Field label="Country code"><input className="input" name="countryCode" defaultValue={p?.countryCode ?? ""} maxLength={2} placeholder="IT" /></Field>
      </div>

      <div className="grid2">
        <Field label="Sleeps"><input className="input" type="number" name="sleeps" min={1} defaultValue={p?.sleeps ?? 2} /></Field>
        <Field label="Bedrooms"><input className="input" type="number" name="bedrooms" min={0} defaultValue={p?.bedrooms ?? 1} /></Field>
        <Field label="Bathrooms"><input className="input" type="number" name="bathrooms" min={0} defaultValue={p?.bathrooms ?? 1} /></Field>
      </div>

      <div className="grid2">
        <Field label="Base price / night"><input className="input" type="number" name="basePrice" min={0} step="1" defaultValue={p ? p.basePriceCents / 100 : 0} /></Field>
        <Field label="Currency">
          <select className="select" name="currency" defaultValue={p?.currency ?? "EUR"}>
            <option>EUR</option><option>USD</option><option>GBP</option>
          </select>
        </Field>
        <Field label="Uplisting property ID"><input className="input" name="uplistingPropertyId" defaultValue={p?.uplistingPropertyId ?? ""} placeholder="(optional)" /></Field>
      </div>

      <Field label="Summary"><input className="input" name="summary" defaultValue={p?.summary ?? ""} /></Field>
      <Field label="Description"><textarea className="textarea" name="description" defaultValue={p?.description ?? ""} /></Field>

      <fieldset style={{ border: "1px solid var(--wb-border)", borderRadius: 10, padding: "0.9rem 1rem", margin: 0 }}>
        <legend style={{ fontSize: "0.85rem", fontWeight: 600, padding: "0 0.35rem" }}>Amenities</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.4rem 1rem" }}>
          {AMENITIES.map((a) => (
            <label key={a.key} style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.9rem" }}>
              <input type="checkbox" name="amenities" value={a.key} defaultChecked={selected.has(a.key)} />
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="row">
        <button type="submit" className="btn btn--primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
