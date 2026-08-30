import Link from "next/link";

export interface Chip {
  readonly label: string;
  readonly href: string;
}

/** A row of pill links — the internal-linking connective tissue between geo/theme pages. */
export function Chips({ items, label }: { readonly items: readonly Chip[]; readonly label?: string }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {items.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          style={{
            display: "inline-flex",
            padding: "0.45rem 0.9rem",
            borderRadius: 999,
            border: "1px solid var(--wb-border)",
            background: "var(--wb-surface)",
            color: "var(--wb-primary)",
            fontSize: "0.9rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
