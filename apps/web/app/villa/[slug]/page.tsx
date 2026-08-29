import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingWidget } from "@/components/BookingWidget";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { getDestination, getProperty, PROPERTIES } from "@/lib/data";
import { breadcrumbJsonLd, nightlyLine, propertyJsonLd } from "@/lib/seo";
import { priceFormatted } from "@/lib/types";

// ISR + on-demand revalidation target (docs 02 §1).
export const revalidate = 3600;

export function generateStaticParams(): { slug: string }[] {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);
  const destination = property && getDestination(property.destinationSlug);
  if (!property || !destination) return {};
  const title = `${property.name}, ${destination.name} — Sleeps ${property.sleeps}`;
  const description = `${property.summary} ${nightlyLine(property)}. Owned & cared for by WelkinBliss.`;
  return {
    title,
    description,
    alternates: { canonical: `/villa/${property.slug}` },
    openGraph: { title, description, url: `/villa/${property.slug}`, type: "website" },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();
  const destination = getDestination(property.destinationSlug);
  if (!destination) notFound();

  return (
    <>
      <JsonLd
        data={[
          propertyJsonLd(property, destination),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: destination.country, path: `/destinations/${destination.slug}` },
            { name: destination.name, path: `/destinations/${destination.slug}` },
            { name: property.name },
          ]),
        ]}
      />

      <div className="container" style={{ paddingTop: "1.5rem" }}>
        <nav aria-label="Breadcrumb" className="muted" style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
          <a href={`/destinations/${destination.slug}`}>{destination.name}</a> · {property.name}
        </nav>

        {/* Gallery — LCP hero + thumbs */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.6rem" }}>
          <Photo gradient={property.gradient} alt={`${property.name} — main view`} ratio="16 / 10" arch priority />
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "0.6rem" }}>
            <Photo gradient={[property.gradient[1], property.gradient[0]]} alt={`${property.name} — interior`} ratio="16 / 9" />
            <Photo gradient={property.gradient} alt={`${property.name} — view`} ratio="16 / 9">
              <span className="btn btn--ghost" style={{ background: "rgba(255,255,255,.85)" }}>
                +{property.photoCount} photos
              </span>
            </Photo>
          </div>
        </div>
      </div>

      <div
        className="container section"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(280px, 1fr)", gap: "clamp(1.5rem, 4vw, 3rem)", alignItems: "start" }}
      >
        <article>
          <p className="eyebrow">{destination.name}, {destination.country}</p>
          <h1>{property.name}</h1>
          <p className="muted" style={{ fontSize: "1.05rem" }}>
            Sleeps {property.sleeps} · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms ·
            {" "}★ {property.rating.toFixed(1)} ({property.reviewCount} reviews)
          </p>

          {/* Answer-first overview (GEO/AEO) */}
          <p style={{ fontSize: "1.15rem", marginTop: "1.25rem" }}>{property.description}</p>

          <h2 style={{ marginTop: "2rem", fontSize: "1.6rem" }}>What this home offers</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.6rem" }}>
            {property.amenities.map((a) => (
              <li key={a.schemaName} style={{ display: "flex", gap: "0.5rem" }}>
                <span aria-hidden style={{ color: "var(--wb-accent)" }}>◆</span> {a.label}
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: "2rem", fontSize: "1.6rem" }}>
            Loved by guests · ★ {property.rating.toFixed(1)}
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {property.reviews.map((r) => (
              <blockquote key={`${r.author}-${r.date}`} className="card" style={{ margin: 0, padding: "1.1rem 1.2rem" }}>
                <p style={{ margin: 0 }}>“{r.body}”</p>
                <footer className="muted" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  {r.author} · {new Date(r.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })} · ★ {r.rating}
                </footer>
              </blockquote>
            ))}
          </div>
        </article>

        <aside>
          <BookingWidget
            propertyName={property.name}
            nightlyPriceCents={property.nightlyPriceCents}
            currency={property.currency}
            maxGuests={property.sleeps}
          />
          <p className="muted" style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.85rem" }}>
            {priceFormatted(property)} / night · {destination.name}
          </p>
        </aside>
      </div>
    </>
  );
}
