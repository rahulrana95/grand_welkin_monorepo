import Link from "next/link";
import { CollectionCard } from "@/components/CollectionCard";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { COLLECTIONS } from "@/lib/collections";
import { DESTINATIONS, PROPERTIES } from "@/lib/data";
import { SITE } from "@/lib/site";

/** Illustrative proof points (owned/operated trust story). Replace with real figures. */
const PROOF: readonly { readonly figure: string; readonly label: string }[] = [
  { figure: "100%", label: "Homes we own & care for" },
  { figure: "24/7", label: "Concierge on every stay" },
  { figure: "4.9★", label: "Average guest rating" },
];

export default function HomePage() {
  return (
    <>
      {/* Restrained arched hero — hands off to inventory quickly (docs 01). */}
      <section className="container" style={{ paddingTop: "2rem" }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "clamp(16px, 14vw, 220px) clamp(16px, 14vw, 220px) 16px 16px",
            minHeight: "min(62vh, 560px)",
            display: "grid",
            alignItems: "end",
            padding: "clamp(2rem, 6vw, 4rem)",
            paddingTop: "clamp(3.5rem, 12vw, 8rem)",
            background: "radial-gradient(120% 100% at 50% 120%, var(--wb-gold) -10%, var(--wb-blue) 45%, #0F1A1E 130%)",
            color: "#fff",
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <p className="eyebrow" style={{ color: "var(--wb-gold-40)" }}>Nature-forward stays</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}>{SITE.tagline}.</h1>
            <p style={{ fontSize: "1.15rem", opacity: 0.92, maxWidth: 520 }}>
              A small collection of serene, light-filled homes — owned and cared for by
              WelkinBliss, with hotel-grade calm and a 24/7 concierge.
            </p>
          </div>
        </div>
        <div style={{ marginTop: "-2rem", position: "relative", zIndex: 2, paddingInline: "clamp(0px, 3vw, 3rem)" }}>
          <SearchBar />
        </div>
      </section>

      {/* Featured homes — browse-first */}
      <section className="container section">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "1.5rem" }}>
          <div>
            <p className="eyebrow">Featured homes</p>
            <h2>Places to find your calm</h2>
          </div>
        </header>
        <div className="grid">
          {PROPERTIES.map((p) => (
            <PropertyCard key={p.slug} property={p} />
          ))}
        </div>
      </section>

      {/* Collections (theme axis of the geo × theme matrix) */}
      <section id="collections" className="container section" style={{ paddingTop: 0 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: "1.25rem" }}>
          <div>
            <p className="eyebrow">Collections</p>
            <h2>Ways to stay</h2>
          </div>
          <Link href="/collections" className="btn btn--ghost">All collections</Link>
        </header>
        <div className="grid">
          {COLLECTIONS.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </section>

      {/* Destinations (geo axis) */}
      <section id="destinations" className="container section" style={{ paddingTop: 0 }}>
        <p className="eyebrow">Destinations</p>
        <h2>Where to wander</h2>
        <div className="grid" style={{ marginTop: "1.25rem" }}>
          {DESTINATIONS.map((d) => (
            <Link key={d.slug} href={`/destinations/${d.slug}`} className="card" style={{ color: "var(--wb-text)" }}>
              <div
                className="arch"
                style={{ aspectRatio: "4 / 3", background: `radial-gradient(120% 90% at 30% 110%, ${d.gradient[1]}, ${d.gradient[0]})` }}
              />
              <div style={{ padding: "1rem 1.2rem 1.3rem" }}>
                <h3 style={{ fontSize: "1.3rem", margin: 0 }}>{d.name}</h3>
                <p className="muted" style={{ margin: "0.25rem 0 0" }}>{d.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust band — owned/operated */}
      <section id="about" className="section" style={{ background: "var(--wb-surface-tinted)" }}>
        <div className="container" style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", textAlign: "center" }}>
          {PROOF.map((p) => (
            <div key={p.label}>
              <div style={{ fontFamily: "var(--wb-font-display)", fontSize: "2.6rem", color: "var(--wb-primary)" }}>{p.figure}</div>
              <div className="muted">{p.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
