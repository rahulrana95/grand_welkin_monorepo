"use client";

import { useMemo, useState, useTransition } from "react";
import { applyPriceRange, toggleBlocked } from "@/lib/actions";

interface PricingCalendarProps {
  readonly propertyId: string;
  readonly currency: string;
  readonly basePriceCents: number;
  readonly pricing: Readonly<Record<string, number>>; // date -> cents
  readonly blocked: readonly string[];
}

type Mode = "price" | "block";

const iso = (d: Date): string => d.toISOString().slice(0, 10);
const firstOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
const lastOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));

export function PricingCalendar({ propertyId, currency, basePriceCents, pricing, blocked }: PricingCalendarProps) {
  const [mode, setMode] = useState<Mode>("price");
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();
  const [priceUnits, setPriceUnits] = useState<number>(Math.round(basePriceCents / 100));
  const [pending, startTransition] = useTransition();

  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const months = useMemo(() => {
    const start = firstOfMonth(new Date());
    return [start, addMonths(start, 1)];
  }, []);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const onCell = (date: string) => {
    if (mode === "block") {
      startTransition(() => void toggleBlocked(propertyId, date));
      return;
    }
    // price mode: pick a start then an end (inclusive)
    if (!from || to || date < from) {
      setFrom(date);
      setTo(undefined);
    } else {
      setTo(date);
    }
  };

  const apply = () => {
    if (!from) return;
    const end = to ?? from;
    startTransition(() => void applyPriceRange(propertyId, from, end, Math.round(priceUnits * 100)));
  };

  return (
    <div className="card stack">
      <div className="between">
        <h2 style={{ margin: 0 }}>Pricing &amp; availability</h2>
        <div className="row" role="tablist" aria-label="Edit mode">
          <button type="button" className={`btn btn--sm ${mode === "price" ? "btn--primary" : "btn--ghost"}`} aria-pressed={mode === "price"} onClick={() => setMode("price")}>Set pricing</button>
          <button type="button" className={`btn btn--sm ${mode === "block" ? "btn--primary" : "btn--ghost"}`} aria-pressed={mode === "block"} onClick={() => setMode("block")}>Block dates</button>
        </div>
      </div>

      {mode === "price" ? (
        <div className="row" style={{ gap: "0.75rem" }}>
          <span className="muted">{from ? (to ? `${from} → ${to}` : `From ${from} — pick an end date`) : "Pick a start date"}</span>
          <span style={{ flex: 1 }} />
          <label className="row" style={{ gap: "0.4rem" }}>
            <span className="muted" style={{ fontSize: "0.8rem" }}>Price / night ({currency})</span>
            <input className="input" style={{ width: 120 }} type="number" min={0} value={priceUnits} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceUnits(Number(e.target.value))} />
          </label>
          <button type="button" className="btn btn--primary btn--sm" disabled={!from || pending} onClick={apply}>
            {pending ? "Applying…" : "Copy price to range"}
          </button>
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>Click a date to block or unblock it. Blocked dates are removed from public availability.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {months.map((month) => (
          <MonthGrid
            key={iso(month)}
            month={month}
            basePriceCents={basePriceCents}
            pricing={pricing}
            blockedSet={blockedSet}
            from={from}
            to={to}
            mode={mode}
            onCell={onCell}
            fmt={fmt}
          />
        ))}
      </div>
    </div>
  );
}

interface MonthGridProps {
  readonly month: Date;
  readonly basePriceCents: number;
  readonly pricing: Readonly<Record<string, number>>;
  readonly blockedSet: ReadonlySet<string>;
  readonly from?: string | undefined;
  readonly to?: string | undefined;
  readonly mode: Mode;
  readonly onCell: (date: string) => void;
  readonly fmt: (cents: number) => string;
}

function MonthGrid({ month, basePriceCents, pricing, blockedSet, from, to, mode, onCell, fmt }: MonthGridProps) {
  const label = month.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const days = lastOfMonth(month).getUTCDate();
  const leading = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)).getUTCDay();

  const cell = (day: number) => {
    const date = iso(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day)));
    const isBlocked = blockedSet.has(date);
    const override = pricing[date];
    const cents = override ?? basePriceCents;
    const selected = date === from || date === to;
    const inRange = Boolean(from && to && date > from && date < to);
    const edge = mode === "price" && (selected || inRange);

    return (
      <button
        key={date}
        type="button"
        onClick={() => onCell(date)}
        aria-label={`${date}${isBlocked ? " blocked" : ` ${fmt(cents)}`}`}
        style={{
          aspectRatio: "1", border: "1px solid var(--wb-border)", borderRadius: 8,
          background: isBlocked ? "var(--wb-border)" : edge ? "var(--wb-blue-08)" : "var(--wb-bg)",
          color: isBlocked ? "var(--wb-text-muted)" : "var(--wb-text)",
          cursor: "pointer", font: "inherit", padding: 2, display: "grid", placeItems: "center", lineHeight: 1,
          outline: selected ? "2px solid var(--wb-primary)" : "none",
        }}
      >
        <span style={{ fontSize: "0.85rem" }}>{day}</span>
        <span style={{ fontSize: "0.58rem", color: override ? "var(--wb-primary)" : "var(--wb-text-muted)" }}>
          {isBlocked ? "—" : fmt(cents).replace(/,000$/, "k")}
        </span>
      </button>
    );
  };

  return (
    <div>
      <p style={{ fontWeight: 600, margin: "0 0 0.4rem" }}>{label}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="muted" style={{ textAlign: "center", fontSize: "0.62rem" }}>{d}</span>
        ))}
        {Array.from({ length: leading }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => cell(i + 1))}
      </div>
    </div>
  );
}
