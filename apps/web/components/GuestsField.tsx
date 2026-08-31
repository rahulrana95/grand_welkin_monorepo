"use client";

import { useEffect, useRef, useState } from "react";

interface GuestsFieldProps {
  readonly ariaLabel: string;
  /** Called with the total (adults + children) whenever counts change. */
  readonly onChange?: (totalGuests: number) => void;
}

interface Category {
  readonly key: "adults" | "children" | "infants";
  readonly label: string;
  readonly hint: string;
  readonly min: number;
  readonly max: number;
}

const CATEGORIES: readonly Category[] = [
  { key: "adults", label: "Adults", hint: "Ages 13+", min: 1, max: 16 },
  { key: "children", label: "Children", hint: "Ages 2–12", min: 0, max: 8 },
  { key: "infants", label: "Infants", hint: "Under 2", min: 0, max: 5 },
];

type Counts = Record<Category["key"], number>;

const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? "" : "s"}`;

const summarize = (c: Counts): string => {
  const parts: string[] = [plural(c.adults, "adult")];
  if (c.children > 0) parts.push(plural(c.children, "child").replace("childs", "children"));
  if (c.infants > 0) parts.push(plural(c.infants, "infant"));
  return parts.join(", ");
};

/**
 * Themed guests picker: Adults / Children / Infants with − / + steppers. The field
 * shows a readable summary ("2 adults, 1 child"). Reuses the popover styling of the
 * other search controls. Posts adults/children/infants + a `who` total via hidden
 * inputs.
 */
export function GuestsField({ ariaLabel, onChange }: GuestsFieldProps) {
  const [counts, setCounts] = useState<Counts>({ adults: 2, children: 0, infants: 0 });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const setCount = (key: Category["key"], next: number) => {
    setCounts((prev) => {
      const updated = { ...prev, [key]: next };
      onChange?.(updated.adults + updated.children);
      return updated;
    });
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <input type="hidden" name="adults" value={counts.adults} />
      <input type="hidden" name="children" value={counts.children} />
      <input type="hidden" name="infants" value={counts.infants} />
      <input type="hidden" name="who" value={counts.adults + counts.children} />

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "0.35rem",
          border: "none",
          background: "transparent",
          font: "inherit",
          color: "var(--wb-text)",
          padding: "0.15rem 0",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {summarize(counts)}
        <span aria-hidden style={{ transition: "transform .15s", transform: open ? "rotate(180deg)" : "none", color: "var(--wb-text-muted)" }}>▾</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={ariaLabel}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            zIndex: 30,
            width: "min(300px, 92vw)",
            background: "var(--wb-surface)",
            border: "1px solid var(--wb-border)",
            borderRadius: 16,
            boxShadow: "0 20px 48px -20px rgba(15,26,30,.45)",
            padding: "0.4rem 0.9rem",
          }}
        >
          {CATEGORIES.map((cat) => {
            const value = counts[cat.key];
            return (
              <div
                key={cat.key}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.7rem 0", borderBottom: cat.key === "infants" ? "none" : "1px solid var(--wb-border)" }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{cat.label}</div>
                  <div className="muted" style={{ fontSize: "0.78rem" }}>{cat.hint}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Stepper sign="−" ariaLabel={`Decrease ${cat.label}`} disabled={value <= cat.min} onClick={() => setCount(cat.key, value - 1)} />
                  <span aria-live="polite" style={{ minWidth: 20, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{value}</span>
                  <Stepper sign="+" ariaLabel={`Increase ${cat.label}`} disabled={value >= cat.max} onClick={() => setCount(cat.key, value + 1)} />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Stepper({ sign, ariaLabel, disabled, onClick }: { readonly sign: string; readonly ariaLabel: string; readonly disabled: boolean; readonly onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: "1px solid var(--wb-border)",
        background: "var(--wb-surface)",
        color: disabled ? "var(--wb-text-muted)" : "var(--wb-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        font: "inherit",
        fontSize: "1.05rem",
        lineHeight: 1,
        display: "grid",
        placeItems: "center",
      }}
    >
      {sign}
    </button>
  );
}
