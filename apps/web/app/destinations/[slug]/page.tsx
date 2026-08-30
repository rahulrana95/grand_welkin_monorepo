import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chips } from "@/components/Chips";
import { JsonLd } from "@/components/JsonLd";
import { PropertyCard } from "@/components/PropertyCard";
import { getPropertiesInDestination } from "@/lib/catalogue";
import { collectionsForDestination } from "@/lib/collections";
import { DESTINATIONS, getDestination } from "@/lib/data";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

// ISR: destination pages are the long-tail SEO engine (docs 02 §1).
export const revalidate = 3600;

export function generateStaticParams(): { slug: string }[] {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return {};
  const title = `${d.name} Villas & Homes — ${d.country}`;
  return {
    title,
    description: `${d.summary} ${d.bestTime}`,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { title, description: d.summary, url: `/destinations/${d.slug}` },
  };
}

interface PageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) notFound();

  const [properties, collections] = await Promise.all([
    getPropertiesInDestination(slug),
    collectionsForDestination(slug),
  ]);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: destination.country, path: `/destinations/${destination.slug}` },
            { name: destination.name },
          ]),
          itemListJsonLd(`Homes in ${destination.name}`, properties),
        ]}
      />

      <section className="container" style={{ paddingTop: "2rem" }}>
        <div
          style={{
            overflow: "hidden",
            borderRadius: "clamp(16px, 12vw, 200px) clamp(16px, 12vw, 200px) 16px 16px",
            minHeight: "min(46vh, 420px)",
            display: "grid",
            alignItems: "end",
            padding: "clamp(1.5rem, 5vw, 3.5rem)",
            paddingTop: "clamp(3rem, 10vw, 7rem)",
            color: "#fff",
            background: `radial-gradient(120% 100% at 50% 120%, ${destination.gradient[1]}, ${destination.gradient[0]} 55%, #0F1A1E 130%)`,
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "var(--wb-gold-40)" }}>
              {destination.region}, {destination.country}
            </p>
            <h1 style={{ color: "#fff" }}>{destination.name}</h1>
            <p style={{ maxWidth: 560, opacity: 0.92 }}>{destination.tagline}</p>
          </div>
        </div>
      </section>

      {/* Answer-first summary (GEO/AEO — docs 03) */}
      <section className="container" style={{ paddingBlock: "2rem", maxWidth: 760 }}>
        <p style={{ fontSize: "1.15rem" }}>{destination.summary}</p>
        <p className="muted"><strong>Best time to visit:</strong> {destination.bestTime}</p>
        <div style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Browse {destination.name} by</p>
          <Chips
            label={`Collections in ${destination.name}`}
            items={collections.map((c) => ({
              label: c.title,
              href: `/collections/${c.slug}/${destination.slug}`,
            }))}
          />
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <h2>Homes in {destination.name}</h2>
        <div className="grid" style={{ marginTop: "1.25rem" }}>
          {properties.map((p) => (
            <PropertyCard key={p.slug} property={p} />
          ))}
        </div>
      </section>
    </>
  );
}
