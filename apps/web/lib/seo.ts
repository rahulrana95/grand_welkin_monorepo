import { SITE, absoluteUrl } from "./site";
import { priceFormatted } from "./types";
import type { Destination, Property } from "./types";

/**
 * JSON-LD builders. See docs/welkinbliss/02-seo-ssr-cwv.md.
 * Self-serve `Product`+`Offer`+`AggregateRating`+`Review` + `BreadcrumbList`
 * work in organic SERPs today; the `VacationRental`/`Accommodation` semantics
 * are kept for entity clarity + the future Hotel Center program.
 */
export type JsonLd = Record<string, unknown>;

export const organizationJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#org`,
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl("/icon.svg"),
  description: SITE.description,
  sameAs: SITE.sameAs,
});

export const websiteJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  publisher: { "@id": `${SITE.url}/#org` },
});

export interface Crumb {
  readonly name: string;
  readonly path?: string; // omit on the current (last) crumb
}

export const breadcrumbJsonLd = (crumbs: readonly Crumb[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    ...(c.path ? { item: absoluteUrl(c.path) } : {}),
  })),
});

export const propertyJsonLd = (property: Property, destination: Destination): JsonLd => {
  const url = absoluteUrl(`/villa/${property.slug}`);
  // Real photos when present; otherwise the property's generated OG image.
  const image =
    property.images && property.images.length > 0
      ? property.images.map((img) => img.src)
      : [absoluteUrl(`/villa/${property.slug}/opengraph-image`)];
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "VacationRental"],
    "@id": `${url}#property`,
    name: `${property.name} — ${destination.name}`,
    description: property.summary,
    image,
    brand: { "@type": "Brand", name: SITE.name },
    url,
    latitude: property.lat,
    longitude: property.lng,
    address: {
      "@type": "PostalAddress",
      addressLocality: destination.name,
      addressRegion: destination.region,
      addressCountry: destination.countryCode,
    },
    containsPlace: {
      "@type": "Accommodation",
      additionalType: "EntirePlace",
      occupancy: { "@type": "QuantitativeValue", value: property.sleeps },
      numberOfBedrooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      amenityFeature: property.amenities.map((a) => ({
        "@type": "LocationFeatureSpecification",
        name: a.schemaName,
        value: true,
      })),
    },
    // Only emit rating/reviews when there ARE reviews — an AggregateRating with
    // reviewCount 0 is invalid and flagged in Search Console.
    ...(property.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: property.rating,
            reviewCount: property.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: property.reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.date,
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: property.currency,
      price: (property.nightlyPriceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url,
    },
  };
};

/** ItemList for listing pages (collection / destination) — carousel eligibility. */
export const itemListJsonLd = (name: string, properties: readonly Property[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: properties.length,
  itemListElement: properties.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: absoluteUrl(`/villa/${p.slug}`),
    name: p.name,
  })),
});

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** FAQPage — rich-result eligibility. The Q&A MUST also be visible on the page. */
export const faqJsonLd = (items: readonly FaqItem[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({
    "@type": "Question",
    name: i.question,
    acceptedAnswer: { "@type": "Answer", text: i.answer },
  })),
});

/** Human-readable price line reused across UI + meta descriptions. */
export const nightlyLine = (property: Property): string =>
  `From ${priceFormatted(property)}/night`;
