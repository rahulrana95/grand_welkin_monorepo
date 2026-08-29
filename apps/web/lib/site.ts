/** Site-wide constants. Single source for URLs, name, and social handles. */
export const SITE = {
  name: "WelkinBliss",
  tagline: "Your calm above it all",
  description:
    "WelkinBliss owns and cares for a small collection of serene, nature-forward homes — calm, light-filled stays with hotel-grade consistency and a 24/7 concierge.",
  url: "https://welkinbliss.com",
  locale: "en_US",
  sameAs: [
    "https://www.instagram.com/welkinbliss",
    "https://www.linkedin.com/company/welkinbliss",
  ],
} as const;

export const absoluteUrl = (path: string): string =>
  new URL(path, SITE.url).toString();
