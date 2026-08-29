import type { MetadataRoute } from "next";
import { DESTINATIONS, PROPERTIES } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

/** Dynamic sitemap — only canonical, indexable URLs. See docs 02 §5. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...DESTINATIONS.map((d) => ({
      url: absoluteUrl(`/destinations/${d.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...PROPERTIES.map((p) => ({
      url: absoluteUrl(`/villa/${p.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
