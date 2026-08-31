"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface DateRangeFieldProps {
  readonly nameFrom: string;
  readonly nameTo: string;
  readonly ariaLabel: string;
  readonly onChange?: (from: string, to: string) => void;
}

const iso = (d: Date): string => d.toISOString().slice(0, 10);
const today = (): string => iso(new Date());
const firstOfMonth = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
const daysInMonth = (d: Date): number => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
const shortDate = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/**
 * Themed check-in → check-out range picker. Opens on the current month; past dates
 * are disabled (selection starts at today). Two months on desktop, stacked on mobile.
 * Carries `from`/`to` in hidden inputs for form submits.
 */
export function DateRangeField({ nameFrom, nameTo, ariaLabel, onChange }: DateRangeFieldProps) {
  const min = today();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => firstOfMonth(new Date()));
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

  const pick = (date: string) => {
    if (date < min) return;
    let nextFrom = from;
    let nextTo = to;
    if (!from || to || date < from) {
      nextFrom = date;
      nextTo = "";
    } else {
      nextTo = date;
    }
    setFrom(nextFrom);
    setTo(nextTo);
    onChange?.(nextFrom, nextTo);
    if (nextFrom && nextTo) setOpen(false);
  };

  const label = from && to ? `${shortDate(from)} – ${shortDate(to)}` : from ? `${shortDate(from)} – …` : "Add dates";
  const canGoPrev = iso(view) > iso(firstOfMonth(new Date()));
  const months = useMemo(() => [view, addMonths(view, 1)], [view]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <input type="hidden" name={nameFrom} value={from} />
      <input type="hidden" name={nameTo} value={to} />
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
          color: from ? "var(--wb-text)" : "var(--wb-text-muted)",
          padding: "0.15rem 0",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {label}
        <span aria-hidden style={{ transition: "transform .15s", transform: open ? "rotate(180deg)" : "none", color: "var(--wb-text-muted)" }}>▾</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={ariaLabel}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            zIndex: 30,
            width: "min(560px, 92vw)",
            background: "var(--wb-surface)",
            border: "1px solid var(--wb-border)",
            borderRadius: 16,
            boxShadow: "0 20px 48px -20px rgba(15,26,30,.45)",
            padding: "0.9rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <button type="button" aria-label="Previous month" disabled={!canGoPrev} onClick={() => setView((v) => addMonths(v, -1))} style={navBtn(!canGoPrev)}>‹</button>
            <button type="button" aria-label="Next month" onClick={() => setView((v) => addMonths(v, 1))} style={navBtn(false)}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {months.map((month) => (
              <MiniMonth key={iso(month)} month={month} min={min} from={from} to={to} onPick={pick} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const navBtn = (disabled: boolean): React.CSSProperties => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid var(--wb-border)",
  background: "var(--wb-surface)",
  color: disabled ? "var(--wb-text-muted)" : "var(--wb-text)",
  cursor: disabled ? "not-allowed" : "pointer",
  font: "inherit",
  opacity: disabled ? 0.5 : 1,
});

interface MiniMonthProps {
  readonly month: Date;
  readonly min: string;
  readonly from: string;
  readonly to: string;
  readonly onPick: (date: string) => void;
}

function MiniMonth({ month, min, from, to, onPick }: MiniMonthProps) {
  const title = month.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const total = daysInMonth(month);
  const leading = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)).getUTCDay();

  const cell = (day: number) => {
    const date = iso(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day)));
    const past = date < min;
    const selected = date === from || date === to;
    const inRange = Boolean(from && to && date > from && date < to);
    return (
      <button
        key={date}
        type="button"
        disabled={past}
        aria-label={date}
        aria-pressed={selected}
        onClick={() => onPick(date)}
        style={{
          aspectRatio: "1",
          border: "none",
          borderRadius: 8,
          background: selected ? "var(--wb-primary)" : inRange ? "var(--wb-blue-08)" : "transparent",
          color: selected ? "var(--wb-on-primary)" : past ? "var(--wb-text-muted)" : "var(--wb-text)",
          cursor: past ? "not-allowed" : "pointer",
          font: "inherit",
          fontSize: "0.85rem",
          opacity: past ? 0.4 : 1,
        }}
      >
        {day}
      </button>
    );
  };

  return (
    <div>
      <p style={{ fontWeight: 600, margin: "0 0 0.4rem", fontSize: "0.9rem" }}>{title}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="muted" style={{ textAlign: "center", fontSize: "0.62rem", padding: "2px 0" }}>{d}</span>
        ))}
        {Array.from({ length: leading }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: total }, (_, i) => cell(i + 1))}
      </div>
    </div>
  );
}
