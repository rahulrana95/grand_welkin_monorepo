import { DESTINATIONS } from "@/lib/data";

/**
 * Emotional, low-commitment search (Wander's "Whenever / Whoever" pattern — docs 01).
 * Server-rendered form; a real build wires this to the search route + calendar island.
 */
export function SearchBar() {
  return (
    <form
      action="/destinations/amalfi-coast"
      role="search"
      aria-label="Find a stay"
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr auto",
        gap: "0.5rem",
        alignItems: "end",
        background: "var(--wb-surface)",
        border: "1px solid var(--wb-border)",
        borderRadius: 999,
        padding: "0.6rem 0.6rem 0.6rem 1.4rem",
        boxShadow: "0 12px 40px -24px rgba(15,26,30,.5)",
      }}
    >
      <Field label="Where to">
        <select name="where" defaultValue="" style={fieldInput}>
          <option value="" disabled>Anywhere serene…</option>
          {DESTINATIONS.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}, {d.country}</option>
          ))}
        </select>
      </Field>
      <Field label="Whenever">
        <input name="when" placeholder="Flexible" style={fieldInput} />
      </Field>
      <Field label="Whoever">
        <input name="who" type="number" min={1} defaultValue={2} style={fieldInput} />
      </Field>
      <button type="submit" className="btn btn--primary" style={{ height: 48 }}>
        Explore
      </button>
    </form>
  );
}

const fieldInput: React.CSSProperties = {
  border: "none",
  background: "transparent",
  font: "inherit",
  color: "var(--wb-text)",
  width: "100%",
  padding: "0.15rem 0",
  outline: "none",
};

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: "0.15rem" }}>
      <span className="eyebrow" style={{ fontSize: "0.68rem" }}>{label}</span>
      {children}
    </label>
  );
}
