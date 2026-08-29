import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** robots.txt — allow crawl + AI retrieval agents; keep app/API surfaces out. See docs 02/03. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/booking/", "/account/", "/*?sort="] },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
