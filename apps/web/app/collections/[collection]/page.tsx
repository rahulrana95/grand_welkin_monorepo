import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chips } from "@/components/Chips";
import { JsonLd } from "@/components/JsonLd";
import { PropertyCard } from "@/components/PropertyCard";
import {
  COLLECTIONS,
  destinationsInCollection,
  getCollection,
  propertiesInCollection,
} from "@/lib/collections";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams(): { collection: string }[] {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

interface PageProps {
  readonly params: Promise<{ readonly collection: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return {
    title: `${collection.title} — WelkinBliss`,
    description: collection.summary,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: { title: collection.title, description: collection.summary, url: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const [properties, destinations] = await Promise.all([
    propertiesInCollection(slug),
    destinationsInCollection(slug),
  ]);
  const propertiesByDestination = new Map<string, typeof properties>();
  for (const p of properties) {
    propertiesByDestination.set(p.destinationSlug, [...(propertiesByDestination.get(p.destinationSlug) ?? []), p]);
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
            { name: collection.title },
          ]),
          itemListJsonLd(collection.title, properties),
        ]}
      />

      <section className="container" style={{ paddingTop: "2rem" }}>
        <div
          style={{
            overflow: "hidden",
            borderRadius: "clamp(16px, 12vw, 180px) clamp(16px, 12vw, 180px) 16px 16px",
            minHeight: "min(38vh, 340px)",
            display: "grid",
            alignItems: "end",
            padding: "clamp(1.5rem, 5vw, 3rem)",
            paddingTop: "clamp(3rem, 10vw, 6rem)",
            color: "#fff",
            background: `radial-gradient(120% 100% at 50% 120%, ${collection.gradient[1]}, ${collection.gradient[0]} 55%, #0F1A1E 130%)`,
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "var(--wb-gold-40)" }}>{collection.kicker}</p>
            <h1 style={{ color: "#fff" }}>{collection.title}</h1>
          </div>
        </div>
      </section>

      {/* Answer-first summary (GEO/AEO) */}
      <section className="container" style={{ paddingBlock: "2rem", maxWidth: 760 }}>
        <p style={{ fontSize: "1.15rem" }}>{collection.summary}</p>
        {/* The geo × theme intersection links — long-tail landing pages */}
        <div style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>By destination</p>
          <Chips
            label={`${collection.title} by destination`}
            items={destinations.map((d) => ({
              label: `${collection.title} in ${d.name}`,
              href: `/collections/${collection.slug}/${d.slug}`,
            }))}
          />
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        {destinations.map((d) => (
          <div key={d.slug} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.5rem" }}>{collection.title} in {d.name}</h2>
            <div className="grid" style={{ marginTop: "1rem" }}>
              {(propertiesByDestination.get(d.slug) ?? []).map((p) => (
                <PropertyCard key={p.slug} property={p} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
