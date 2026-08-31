import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default branded share image for every page without a more specific one. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          color: "#fff",
          background: "radial-gradient(120% 100% at 50% 120%, #E3BA38 -10%, #2F6D7F 45%, #0F1A1E 130%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#E3BA38" }}>
          {SITE.name}
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 12 }}>
          {SITE.tagline}
        </div>
        <div style={{ display: "flex", fontSize: 30, opacity: 0.9, marginTop: 20, maxWidth: 900 }}>
          Serene, light-filled homes — owned &amp; cared for by WelkinBliss.
        </div>
      </div>
    ),
    { ...size },
  );
}
