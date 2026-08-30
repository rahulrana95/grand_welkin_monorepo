import type { Metadata } from "next";
import { BookingWidget } from "@/components/BookingWidget";
import { Chips } from "@/components/Chips";
import { CollectionCard } from "@/components/CollectionCard";
import { Logo } from "@/components/Logo";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { COLLECTIONS } from "@/lib/collections";
import { PROPERTIES } from "@/lib/data";

/**
 * Component gallery — every component in its states, each wrapped with a
 * `data-visual` handle so the visual suite can screenshot it in isolation.
 * Not indexed; a preview/QA surface, not a public page.
 */
export const metadata: Metadata = { title: "UI gallery", robots: { index: false, follow: false } };

const property = PROPERTIES[0]!;
const collection = COLLECTIONS[0]!;

function Case({ id, children }: { readonly id: string; readonly children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>{id}</p>
      <div data-visual={id} style={{ display: "inline-block", maxWidth: 420, width: "100%" }}>
        {children}
      </div>
    </section>
  );
}

export default function UiGalleryPage() {
  return (
    <div className="container section">
      <h1>UI gallery</h1>
      <p className="muted" style={{ marginBottom: "2.5rem" }}>
        Baseline surface for visual regression — each block is screenshot-tested.
      </p>

      <Case id="logo-color"><Logo variant="color" height={56} /></Case>
      <Case id="logo-mono"><span style={{ color: "var(--wb-blue)" }}><Logo variant="mono" height={56} /></span></Case>
      <Case id="logo-black"><Logo variant="black" height={56} /></Case>
      <Case id="logo-monogram"><Logo variant="color" height={56} withWordmark={false} /></Case>

      <Case id="button-primary"><button className="btn btn--primary">Request to book</button></Case>
      <Case id="button-ghost"><button className="btn btn--ghost">All collections</button></Case>

      <Case id="chips">
        <Chips
          label="sample"
          items={[
            { label: "Homes with a pool in Amalfi Coast", href: "#" },
            { label: "Coastal homes in Santorini", href: "#" },
          ]}
        />
      </Case>

      <Case id="property-card"><PropertyCard property={property} /></Case>
      <Case id="collection-card"><CollectionCard collection={collection} /></Case>

      <Case id="booking-widget">
        <BookingWidget
          propertyName={property.name}
          nightlyPriceCents={property.nightlyPriceCents}
          currency={property.currency}
          maxGuests={property.sleeps}
        />
      </Case>

      <section style={{ marginBottom: "2.5rem" }}>
        <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>search-bar</p>
        <div data-visual="search-bar">
          <SearchBar />
        </div>
      </section>
    </div>
  );
}
