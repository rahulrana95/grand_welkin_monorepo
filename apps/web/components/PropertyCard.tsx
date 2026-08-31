import Link from "next/link";
import { Photo } from "./Photo";
import { priceFormatted, type Property } from "@/lib/types";

export function PropertyCard({ property }: { readonly property: Property }) {
  return (
    <article className="card">
      <Link href={`/villa/${property.slug}`} aria-label={property.name}>
        <Photo
          gradient={property.gradient}
          image={property.images?.[0]}
          sizes="(max-width: 700px) 100vw, 33vw"
          alt={`${property.name} — exterior`}
          ratio="4 / 3"
        />
      </Link>
      <div style={{ padding: "1.1rem 1.2rem 1.3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "baseline" }}>
          <h3 style={{ fontSize: "1.25rem", margin: 0 }}>
            <Link href={`/villa/${property.slug}`} style={{ color: "var(--wb-text)" }}>
              {property.name}
            </Link>
          </h3>
          <span aria-label={`Rated ${property.rating} out of 5`} style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
            ★ {property.rating.toFixed(1)}
          </span>
        </div>
        <p className="muted" style={{ margin: "0.35rem 0 0.9rem" }}>{property.summary}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "0.75rem" }}>
          <span className="muted" style={{ fontSize: "0.9rem" }}>
            Sleeps {property.sleeps} · {property.bedrooms} bed · {property.bathrooms} bath
          </span>
          <div style={{ textAlign: "right", lineHeight: 1.15, whiteSpace: "nowrap" }}>
            <span className="muted" style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.03em" }}>From</span>
            <strong style={{ fontSize: "1.1rem" }}>{priceFormatted(property)}</strong>
            <span className="muted" style={{ fontSize: "0.75rem" }}> /night</span>
          </div>
        </div>
      </div>
    </article>
  );
}
