import { ImageResponse } from "next/og";
import { getPropertyBySlug } from "@/lib/catalogue";
import { getDestination } from "@/lib/data";
import { SITE } from "@/lib/site";
import { priceFormatted } from "@/lib/types";

export const alt = "WelkinBliss home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Per-property share image: name, place, and nightly price on the brand gradient. */
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  const destination = property && getDestination(property.destinationSlug);
  const [from, to] = property?.gradient ?? ["#2F6D7F", "#E3BA38"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#fff",
          background: `radial-gradient(120% 100% at 50% 120%, ${to} -10%, ${from} 45%, #0F1A1E 130%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#E3BA38" }}>
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {destination ? (
            <div style={{ display: "flex", fontSize: 30, opacity: 0.9 }}>
              {destination.name}, {destination.country}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 8 }}>
            {property?.name ?? "A WelkinBliss home"}
          </div>
          {property ? (
            <div style={{ display: "flex", fontSize: 34, marginTop: 18 }}>
              Sleeps {property.sleeps} · From {priceFormatted(property)}/night
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
