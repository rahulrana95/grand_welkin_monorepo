import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — brand tile (blue ground, gold sun over an arch). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: "#2F6D7F",
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: 64,
            borderTopRightRadius: 64,
            background: "#F7F4EC",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 28, background: "#E3BA38", marginBottom: 8 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
