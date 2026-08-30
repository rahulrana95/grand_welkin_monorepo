import Link from "next/link";
import type { Collection } from "@/lib/collections";
import { propertiesInCollection } from "@/lib/collections";

export function CollectionCard({ collection }: { readonly collection: Collection }) {
  const count = propertiesInCollection(collection.slug).length;
  return (
    <Link href={`/collections/${collection.slug}`} className="card" style={{ color: "var(--wb-text)" }}>
      <div
        className="arch"
        style={{
          aspectRatio: "4 / 3",
          background: `radial-gradient(120% 90% at 30% 110%, ${collection.gradient[1]}, ${collection.gradient[0]})`,
        }}
      />
      <div style={{ padding: "1rem 1.2rem 1.3rem" }}>
        <p className="eyebrow" style={{ fontSize: "0.68rem" }}>{collection.kicker}</p>
        <h3 style={{ fontSize: "1.3rem", margin: "0.15rem 0 0" }}>{collection.title}</h3>
        <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
          {count} {count === 1 ? "home" : "homes"}
        </p>
      </div>
    </Link>
  );
}
