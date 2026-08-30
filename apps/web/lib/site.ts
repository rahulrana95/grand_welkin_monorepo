/** Site-wide constants. Single source for URLs, name, and social handles. */
export const SITE = {
  name: "WelkinBliss",
  tagline: "Your calm above it all",
  description:
    "WelkinBliss owns and cares for a small collection of serene, nature-forward homes — calm, light-filled stays with hotel-grade consistency and a 24/7 concierge.",
  url: "https://welkinbliss.com",
  locale: "en_US",
  /** Concierge WhatsApp number (E.164). Bookings are handled here, not on-site. */
  whatsapp: "+15550000000",
  sameAs: [
    "https://www.instagram.com/welkinbliss",
    "https://www.linkedin.com/company/welkinbliss",
  ],
} as const;

export const absoluteUrl = (path: string): string =>
  new URL(path, SITE.url).toString();

export interface WhatsAppBooking {
  readonly propertyName: string;
  readonly checkIn?: string | undefined;
  readonly checkOut?: string | undefined;
  readonly guests?: number | undefined;
}

/** Deep link to the concierge WhatsApp with a prefilled booking enquiry. */
export function whatsappBookingUrl(booking: WhatsAppBooking): string {
  const number = SITE.whatsapp.replace(/[^\d]/g, "");
  const lines = [
    `Hi WelkinBliss — I'd love to book ${booking.propertyName}.`,
    booking.checkIn && booking.checkOut ? `Dates: ${booking.checkIn} → ${booking.checkOut}` : undefined,
    booking.guests ? `Guests: ${booking.guests}` : undefined,
  ].filter(Boolean);
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}
