import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/BookingPanel";
import { Chips } from "@/components/Chips";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { getProperties, getPropertyBySlug } from "@/lib/catalogue";
import { COLLECTIONS } from "@/lib/collections";
import { getDestination } from "@/lib/data";
import { breadcrumbJsonLd, nightlyLine, propertyJsonLd } from "@/lib/seo";
import { priceFormatted } from "@/lib/types";

// ISR + on-demand revalidation target (docs 02 §1).
export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await getProperties()).map((p) => ({ slug: p.slug }));
}

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
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
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  const destination = getDestination(property.destinationSlug);
  if (!destination) notFound();

  const matchingCollections = COLLECTIONS.filter((c) => c.match(property, destination));
  const [hero, second, third] = property.images ?? [];

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
          <Photo gradient={property.gradient} image={hero} sizes="(max-width: 900px) 100vw, 66vw" alt={`${property.name} — main view`} ratio="16 / 10" arch priority />
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "0.6rem" }}>
            <Photo gradient={[property.gradient[1], property.gradient[0]]} image={second} sizes="33vw" alt={`${property.name} — interior`} ratio="16 / 9" />
            <Photo gradient={property.gradient} image={third} sizes="33vw" alt={`${property.name} — view`} ratio="16 / 9">
              {property.photoCount > 0 ? (
                <span className="btn btn--ghost" style={{ background: "rgba(255,255,255,.85)" }}>
                  +{property.photoCount} photos
                </span>
              ) : null}
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
            Sleeps {property.sleeps} · {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
            {property.reviewCount > 0 ? <> · ★ {property.rating.toFixed(1)} ({property.reviewCount} reviews)</> : null}
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

          {property.reviews.length > 0 ? (
          <>
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
          </>
          ) : null}
        </article>

        <aside>
          <BookingPanel
            propertySlug={property.slug}
            propertyName={property.name}
            currency={property.currency}
            maxGuests={property.sleeps}
          />
          <p className="muted" style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.85rem" }}>
            {priceFormatted(property)} / night · {destination.name}
          </p>
        </aside>
      </div>

      <section className="container section" style={{ paddingTop: 0 }}>
        <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Explore more</p>
        <Chips
          label="Related collections and destination"
          items={[
            ...matchingCollections.map((c) => ({
              label: `${c.title} in ${destination.name}`,
              href: `/collections/${c.slug}/${destination.slug}`,
            })),
            { label: `All homes in ${destination.name}`, href: `/destinations/${destination.slug}` },
          ]}
        />
      </section>
    </>
  );
}
