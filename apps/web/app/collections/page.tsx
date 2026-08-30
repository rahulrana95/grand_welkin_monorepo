import type { Metadata } from "next";
import Link from "next/link";
import { CollectionCard } from "@/components/CollectionCard";
import { JsonLd } from "@/components/JsonLd";
import { COLLECTIONS } from "@/lib/collections";
import { DESTINATIONS } from "@/lib/data";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Collections — ways to stay",
  description:
    "Browse WelkinBliss by the way you want to stay: coastal homes, mountain retreats, homes with a private pool, chef-service stays, and pet-friendly homes — each one owned and cared for by us.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Collections" }])} />

      <section className="container section" style={{ paddingBottom: "1rem" }}>
        <p className="eyebrow">Collections</p>
        <h1>Ways to stay</h1>
        <p className="muted" style={{ maxWidth: 640, fontSize: "1.1rem" }}>
          Every WelkinBliss home fits a certain kind of calm. Browse by the experience you’re
          after — then narrow to a destination.
        </p>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="grid">
          {COLLECTIONS.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: "1.6rem" }}>Or browse by destination</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "0.75rem" }}>
          {DESTINATIONS.map((d) => (
            <Link key={d.slug} href={`/destinations/${d.slug}`} className="btn btn--ghost">
              {d.name}
            </Link>
          ))}
          <Link href="/explore" className="btn btn--ghost">Explore everything →</Link>
        </div>
      </section>
    </>
  );
}
