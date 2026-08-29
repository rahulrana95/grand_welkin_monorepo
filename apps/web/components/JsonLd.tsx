import type { JsonLd as JsonLdData } from "@/lib/seo";

/** Renders a JSON-LD block server-side (structured data must be in the SSR HTML). */
export function JsonLd({ data }: { readonly data: JsonLdData | readonly JsonLdData[] }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, app-generated content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
