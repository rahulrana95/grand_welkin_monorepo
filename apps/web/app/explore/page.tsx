import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getProperties } from "@/lib/catalogue";
import { COLLECTIONS, destinationsInCollection } from "@/lib/collections";
import { DESTINATIONS } from "@/lib/data";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Explore every WelkinBliss stay",
  description:
    "An index of every WelkinBliss destination, collection, and home — the fastest way to find the exact calm you’re after.",
  alternates: { canonical: "/explore" },
};

/**
 * Crawlable HTML sitemap hub — flat click-depth links to every destination,
 * collection, and (geo × theme) landing page so deep pages get indexed and
 * receive internal link equity (docs 01 — Marriott's sitemap hubs).
 */
export default async function ExplorePage() {
  const properties = await getProperties();
  const destinationsByCollection = new Map(
    await Promise.all(
      COLLECTIONS.map(async (c) => [c.slug, await destinationsInCollection(c.slug)] as const),
    ),
  );
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Explore" }])} />

      <section className="container section" style={{ paddingBottom: "1rem" }}>
        <p className="eyebrow">Explore</p>
        <h1>Every stay, one page</h1>
        <p className="muted" style={{ maxWidth: 620 }}>
          Destinations, collections, and every home — find the exact calm you’re after.
        </p>
      </section>

      <section className="container section" style={{ paddingTop: 0, display: "grid", gap: "2.5rem" }}>
        <Group title="Destinations">
          {DESTINATIONS.map((d) => (
            <li key={d.slug}><Link href={`/destinations/${d.slug}`}>{d.name}, {d.country}</Link></li>
          ))}
        </Group>

        <Group title="Collections">
          {COLLECTIONS.map((c) => (
            <li key={c.slug}><Link href={`/collections/${c.slug}`}>{c.title}</Link></li>
          ))}
        </Group>

        <div>
          <h2 style={{ fontSize: "1.5rem" }}>By collection &amp; destination</h2>
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: "1rem" }}>
            {COLLECTIONS.map((c) => (
              <div key={c.slug}>
                <h3 style={{ fontSize: "1.05rem", margin: "0 0 0.5rem" }}>
                  <Link href={`/collections/${c.slug}`}>{c.title}</Link>
                </h3>
                <ul style={listStyle}>
                  {(destinationsByCollection.get(c.slug) ?? []).map((d) => (
                    <li key={d.slug}>
                      <Link href={`/collections/${c.slug}/${d.slug}`} className="muted">
                        {c.title} in {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Group title="All homes">
          {properties.map((p) => (
            <li key={p.slug}><Link href={`/villa/${p.slug}`}>{p.name}</Link></li>
          ))}
        </Group>
      </section>
    </>
  );
}

const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, display: "grid", gap: "0.4rem" };

function Group({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: "1.5rem" }}>{title}</h2>
      <ul style={{ ...listStyle, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", marginTop: "1rem" }}>
        {children}
      </ul>
    </div>
  );
}
