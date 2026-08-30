import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chips } from "@/components/Chips";
import { JsonLd } from "@/components/JsonLd";
import { PropertyCard } from "@/components/PropertyCard";
import {
  collectionsForDestination,
  destinationsInCollection,
  getCollection,
  propertiesInCollectionAndDestination,
  validIntersections,
} from "@/lib/collections";
import { getDestination } from "@/lib/data";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams(): { collection: string; destination: string }[] {
  return validIntersections().map((x) => ({ collection: x.collection, destination: x.destination }));
}

interface PageProps {
  readonly params: Promise<{ readonly collection: string; readonly destination: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collection: cSlug, destination: dSlug } = await params;
  const collection = getCollection(cSlug);
  const destination = getDestination(dSlug);
  if (!collection || !destination) return {};
  const title = `${collection.title} in ${destination.name}, ${destination.country}`;
  const description = `${collection.title} owned & cared for by WelkinBliss in ${destination.name}. ${collection.summary}`;
  return {
    title,
    description,
    alternates: { canonical: `/collections/${collection.slug}/${destination.slug}` },
    openGraph: { title, description, url: `/collections/${collection.slug}/${destination.slug}` },
  };
}

export default async function IntersectionPage({ params }: PageProps) {
  const { collection: cSlug, destination: dSlug } = await params;
  const collection = getCollection(cSlug);
  const destination = getDestination(dSlug);
  if (!collection || !destination) notFound();

  const properties = propertiesInCollectionAndDestination(cSlug, dSlug);
  if (properties.length === 0) notFound(); // no soft-404s (docs 02 §5)

  // Internal linking: sibling collections here + the same collection elsewhere.
  const siblingCollections = collectionsForDestination(dSlug).filter((c) => c.slug !== cSlug);
  const otherDestinations = destinationsInCollection(cSlug).filter((d) => d.slug !== dSlug);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
            { name: collection.title, path: `/collections/${collection.slug}` },
            { name: destination.name },
          ]),
          itemListJsonLd(`${collection.title} in ${destination.name}`, properties),
        ]}
      />

      <section className="container section" style={{ paddingBottom: "1rem" }}>
        <p className="eyebrow">{destination.region}, {destination.country}</p>
        <h1>{collection.title} in {destination.name}</h1>
        {/* Answer-first, entity-explicit passage */}
        <p style={{ fontSize: "1.15rem", maxWidth: 760 }}>{collection.summary}</p>
        <p className="muted" style={{ maxWidth: 760 }}>{destination.summary}</p>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="grid">
          {properties.map((p) => (
            <PropertyCard key={p.slug} property={p} />
          ))}
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0, display: "grid", gap: "1.5rem" }}>
        {siblingCollections.length > 0 ? (
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>More ways to stay in {destination.name}</p>
            <Chips
              label={`Other collections in ${destination.name}`}
              items={siblingCollections.map((c) => ({
                label: `${c.title} in ${destination.name}`,
                href: `/collections/${c.slug}/${destination.slug}`,
              }))}
            />
          </div>
        ) : null}
        {otherDestinations.length > 0 ? (
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>{collection.title} elsewhere</p>
            <Chips
              label={`${collection.title} in other destinations`}
              items={otherDestinations.map((d) => ({
                label: `${collection.title} in ${d.name}`,
                href: `/collections/${collection.slug}/${d.slug}`,
              }))}
            />
          </div>
        ) : null}
      </section>
    </>
  );
}
