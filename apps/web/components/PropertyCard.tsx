import Link from "next/link";
import { Icon, amenityIconFor, type IconName } from "./Icon";
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
        <p className="muted" style={{ margin: "0.35rem 0 0.8rem" }}>{property.summary}</p>

        <div className="wb-stats" aria-label="Capacity">
          <Stat icon="guests" value={property.sleeps} label={`Sleeps ${property.sleeps}`} />
          <Stat icon="bed" value={property.bedrooms} label={`${property.bedrooms} bedrooms`} />
          <Stat icon="bath" value={property.bathrooms} label={`${property.bathrooms} bathrooms`} />
        </div>

        {property.amenities.length > 0 ? (
          <ul className="wb-amenity-row" aria-label="Amenities">
            {property.amenities.slice(0, 4).map((a) => (
              <li key={a.schemaName} title={a.label}>
                <Icon name={amenityIconFor(a.schemaName)} label={a.label} size={17} />
              </li>
            ))}
            {property.amenities.length > 4 ? (
              <li className="muted" style={{ fontSize: "0.8rem" }}>+{property.amenities.length - 4}</li>
            ) : null}
          </ul>
        ) : null}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.9rem", paddingTop: "0.8rem", borderTop: "1px solid var(--wb-border)" }}>
          <div style={{ textAlign: "right", lineHeight: 1.15, whiteSpace: "nowrap" }}>
            <span className="muted" style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.03em" }}>From</span>
            <strong style={{ fontSize: "1.15rem" }}>{priceFormatted(property)}</strong>
            <span className="muted" style={{ fontSize: "0.75rem" }}> /night</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Stat({ icon, value, label }: { readonly icon: IconName; readonly value: number; readonly label: string }) {
  return (
    <span className="wb-stat" aria-label={label}>
      <Icon name={icon} />
      <span>{value}</span>
    </span>
  );
}
