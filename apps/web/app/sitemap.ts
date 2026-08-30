import type { MetadataRoute } from "next";
import { COLLECTIONS, validIntersections } from "@/lib/collections";
import { DESTINATIONS, PROPERTIES } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

/** Dynamic sitemap — only canonical, indexable URLs. See docs 02 §5. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const daily = "daily" as const;
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/collections"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/explore"), lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    ...DESTINATIONS.map((d) => ({
      url: absoluteUrl(`/destinations/${d.slug}`),
      lastModified: now,
      changeFrequency: daily,
      priority: 0.8,
    })),
    ...COLLECTIONS.map((c) => ({
      url: absoluteUrl(`/collections/${c.slug}`),
      lastModified: now,
      changeFrequency: daily,
      priority: 0.8,
    })),
    // (geo × theme) landing pages
    ...validIntersections().map((x) => ({
      url: absoluteUrl(`/collections/${x.collection}/${x.destination}`),
      lastModified: now,
      changeFrequency: daily,
      priority: 0.7,
    })),
    ...PROPERTIES.map((p) => ({
      url: absoluteUrl(`/villa/${p.slug}`),
      lastModified: now,
      changeFrequency: daily,
      priority: 0.9,
    })),
  ];
}
