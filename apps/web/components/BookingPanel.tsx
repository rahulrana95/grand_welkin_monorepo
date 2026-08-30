"use client";

import { useEffect, useMemo, useState } from "react";
import type { DayAvailability } from "@welkinbliss/availability";
import { whatsappBookingUrl } from "@/lib/site";

interface BookingPanelProps {
  readonly propertySlug: string;
  readonly propertyName: string;
  readonly currency: string;
  readonly maxGuests: number;
}

type Load =
  | { readonly status: "loading" }
  | { readonly status: "error" }
  | { readonly status: "ready"; readonly byDate: ReadonlyMap<string, DayAvailability> };

const iso = (d: Date): string => d.toISOString().slice(0, 10);
const firstOfMonth = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
const lastOfMonth = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
const nightsBetween = (a: string, b: string): number =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export function BookingPanel({ propertySlug, propertyName, currency, maxGuests }: BookingPanelProps) {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState<string | undefined>();
  const [checkOut, setCheckOut] = useState<string | undefined>();

  // Two visible months anchored on "today" (frozen in visual tests).
  const months = useMemo(() => {
    const start = firstOfMonth(new Date());
    return [start, addMonths(start, 1)];
  }, []);
  const rangeFrom = iso(months[0]!);
  const rangeTo = iso(lastOfMonth(months[1]!));

  useEffect(() => {
    let active = true;
    setLoad({ status: "loading" });
    fetch(`/api/availability/${propertySlug}?from=${rangeFrom}&to=${rangeTo}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { days: readonly DayAvailability[] }) => {
        if (!active) return;
        setLoad({ status: "ready", byDate: new Map(data.days.map((d) => [d.date, d])) });
      })
      .catch(() => active && setLoad({ status: "error" }));
    return () => {
      active = false;
    };
  }, [propertySlug, rangeFrom, rangeTo]);

  const fmt = (cents: number): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const rangeIsBookable = (a: string, b: string): boolean => {
    if (load.status !== "ready") return false;
    for (let d = new Date(`${a}T00:00:00Z`); iso(d) < b; d.setUTCDate(d.getUTCDate() + 1)) {
      if (load.byDate.get(iso(d))?.status !== "available") return false;
    }
    return true;
  };

  const onPick = (date: string) => {
    if (load.status !== "ready" || load.byDate.get(date)?.status !== "available") return;
    if (!checkIn || checkOut || date <= checkIn) {
      setCheckIn(date);
      setCheckOut(undefined);
    } else if (rangeIsBookable(checkIn, date)) {
      setCheckOut(date);
    } else {
      setCheckIn(date);
      setCheckOut(undefined);
    }
  };

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const totalCents = useMemo(() => {
    if (load.status !== "ready" || !checkIn || !checkOut) return 0;
    let sum = 0;
    for (let d = new Date(`${checkIn}T00:00:00Z`); iso(d) < checkOut; d.setUTCDate(d.getUTCDate() + 1)) {
      sum += load.byDate.get(iso(d))?.priceCents ?? 0;
    }
    return sum;
  }, [load, checkIn, checkOut]);

  const waHref = whatsappBookingUrl({ propertyName, checkIn, checkOut, guests });

  return (
    <form
      aria-label={`Check availability for ${propertyName}`}
      onSubmit={(e: React.FormEvent) => e.preventDefault()}
      style={{ position: "sticky", top: 96, background: "var(--wb-surface)", border: "1px solid var(--wb-border)", borderRadius: "var(--wb-radius)", padding: "1.4rem", display: "grid", gap: "1rem" }}
    >
      <div>
        <strong style={{ fontSize: "1.05rem" }}>Check availability</strong>
        <p className="muted" style={{ margin: "0.15rem 0 0", fontSize: "0.85rem" }}>Pick your dates, then book with our concierge on WhatsApp.</p>
      </div>

      {load.status === "loading" ? <p role="status" className="muted">Loading calendar…</p> : null}
      {load.status === "error" ? <p role="alert" className="muted">Couldn’t load availability.</p> : null}

      {load.status === "ready" ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          {months.map((month) => (
            <Month
              key={iso(month)}
              month={month}
              byDate={load.byDate}
              checkIn={checkIn}
              checkOut={checkOut}
              onPick={onPick}
              fmt={fmt}
            />
          ))}
        </div>
      ) : null}

      <Legend />

      <label style={{ display: "grid", gap: "0.2rem" }}>
        <span className="eyebrow">Guests</span>
        <input
          type="number"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuests(Number(e.target.value))}
          style={{ font: "inherit", padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid var(--wb-border)", background: "var(--wb-bg)", color: "var(--wb-text)" }}
        />
      </label>

      {nights > 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--wb-border)", paddingTop: "0.75rem" }}>
          <span className="muted">{nights} {nights === 1 ? "night" : "nights"}</span>
          <strong>{fmt(totalCents)}</strong>
        </div>
      ) : null}

      <a className="btn btn--primary" href={waHref} target="_blank" rel="noopener noreferrer" style={{ justifyContent: "center" }}>
        {nights > 0 ? "Book these dates on WhatsApp" : "Enquire on WhatsApp"}
      </a>
      <p className="muted" style={{ fontSize: "0.8rem", margin: 0, textAlign: "center" }}>
        A WelkinBliss concierge confirms every stay. No online payment.
      </p>
    </form>
  );
}

interface MonthProps {
  readonly month: Date;
  readonly byDate: ReadonlyMap<string, DayAvailability>;
  readonly checkIn?: string | undefined;
  readonly checkOut?: string | undefined;
  readonly onPick: (date: string) => void;
  readonly fmt: (cents: number) => string;
}

function Month({ month, byDate, checkIn, checkOut, onPick, fmt }: MonthProps) {
  const label = month.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const days = lastOfMonth(month).getUTCDate();
  const leading = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)).getUTCDay();

  const cell = (day: number) => {
    const date = iso(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day)));
    const info = byDate.get(date);
    const status = info?.status ?? "blocked";
    const selected = date === checkIn || date === checkOut;
    const inRange = Boolean(checkIn && checkOut && date > checkIn && date < checkOut);
    const available = status === "available";

    const bg = selected ? "var(--wb-primary)" : inRange ? "var(--wb-blue-08)" : "transparent";
    const color = selected ? "var(--wb-on-primary)" : available ? "var(--wb-text)" : "var(--wb-text-muted)";

    return (
      <button
        key={date}
        type="button"
        data-status={status}
        aria-label={`${date} — ${status}`}
        disabled={!available}
        onClick={() => onPick(date)}
        style={{
          aspectRatio: "1", border: "none", borderRadius: 8, background: bg, color,
          cursor: available ? "pointer" : "not-allowed", font: "inherit", padding: 2,
          display: "grid", placeItems: "center", lineHeight: 1,
          textDecoration: status === "blocked" ? "line-through" : "none",
          opacity: available || selected ? 1 : 0.55,
        }}
      >
        <span style={{ fontSize: "0.9rem" }}>{day}</span>
        {available && info?.priceCents ? (
          <span style={{ fontSize: "0.6rem", color: selected ? "inherit" : "var(--wb-text-muted)" }}>
            {fmt(info.priceCents).replace(/,000$/, "k")}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div>
      <p style={{ fontWeight: 600, margin: "0 0 0.4rem" }}>{label}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="muted" style={{ textAlign: "center", fontSize: "0.65rem", padding: "2px 0" }}>{d}</span>
        ))}
        {Array.from({ length: leading }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => cell(i + 1))}
      </div>
    </div>
  );
}

function Legend() {
  const item = (color: string, label: string) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem" }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, border: "1px solid var(--wb-border)" }} /> {label}
    </span>
  );
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }} className="muted">
      {item("var(--wb-surface)", "Available")}
      {item("var(--wb-blue-08)", "Selected")}
      {item("var(--wb-border)", "Booked / blocked")}
    </div>
  );
}
