import { ImageResponse } from "next/og";

export const alt = "Onishi — Authentic Sushi · Témara";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #da693f 0%, #a8431f 100%)",
          color: "#fff5e6",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* décor : cercle maki */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 420,
            height: 420,
            borderRadius: 420,
            border: "30px solid rgba(255,245,230,0.14)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(255,245,230,0.85)",
          }}
        >
          ● Authentic Sushi · Témara
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 130, lineHeight: 1, fontWeight: 700 }}>Onishi</div>
          <div style={{ fontSize: 46, marginTop: 16, color: "rgba(255,245,230,0.92)" }}>
            L&apos;art du sushi, servi avec soin.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontFamily: "system-ui, sans-serif",
            color: "rgba(255,245,230,0.85)",
          }}
        >
          Commande en ligne · Livraison &amp; à emporter
        </div>
      </div>
    ),
    { ...size }
  );
}
