"use client";

import { useMemo, useState } from "react";

interface BookingWidgetProps {
  readonly propertyName: string;
  readonly nightlyPriceCents: number;
  readonly currency: "USD" | "EUR" | "GBP";
  readonly maxGuests: number;
}

/** Client island inside the (server-rendered, indexed) property page. */
type RequestState =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "sent" };

export function BookingWidget({ propertyName, nightlyPriceCents, currency, maxGuests }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [request, setRequest] = useState<RequestState>({ status: "idle" });

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return ms > 0 ? Math.round(ms / 86_400_000) : 0;
  }, [checkIn, checkOut]);

  const format = (cents: number): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const total = nights * nightlyPriceCents;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequest({ status: "submitting" });
    // Demo only — a real build calls the booking API via the generated client.
    window.setTimeout(() => setRequest({ status: "sent" }), 600);
  };

  return (
    <form
      onSubmit={submit}
      aria-label={`Request to stay at ${propertyName}`}
      style={{
        position: "sticky",
        top: 96,
        background: "var(--wb-surface)",
        border: "1px solid var(--wb-border)",
        borderRadius: "var(--wb-radius)",
        padding: "1.4rem",
        display: "grid",
        gap: "0.85rem",
      }}
    >
      <strong style={{ fontSize: "1.15rem" }}>{format(nightlyPriceCents)} <span className="muted">/ night</span></strong>
      <label style={{ display: "grid", gap: "0.2rem" }}>
        <span className="eyebrow">Check in</span>
        <input type="date" value={checkIn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckIn(e.target.value)} style={inputStyle} />
      </label>
      <label style={{ display: "grid", gap: "0.2rem" }}>
        <span className="eyebrow">Check out</span>
        <input type="date" value={checkOut} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckOut(e.target.value)} style={inputStyle} />
      </label>
      <label style={{ display: "grid", gap: "0.2rem" }}>
        <span className="eyebrow">Guests</span>
        <input
          type="number"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuests(Number(e.target.value))}
          style={inputStyle}
        />
      </label>

      {nights > 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--wb-border)", paddingTop: "0.75rem" }}>
          <span className="muted">{format(nightlyPriceCents)} × {nights} nights</span>
          <strong>{format(total)}</strong>
        </div>
      ) : null}

      <button type="submit" className="btn btn--primary" disabled={request.status === "submitting"}>
        {request.status === "sent" ? "Request sent ✓" : request.status === "submitting" ? "Sending…" : "Request to book"}
      </button>
      <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
        You won’t be charged yet. A WelkinBliss host confirms every stay.
      </p>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  font: "inherit",
  padding: "0.6rem 0.7rem",
  borderRadius: 8,
  border: "1px solid var(--wb-border)",
  background: "var(--wb-bg)",
  color: "var(--wb-text)",
};
