import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Onishi — Authentic Sushi",
    short_name: "Onishi",
    description:
      "Sushi raffiné à Témara. Commandez en ligne, à emporter ou en livraison — suivi en temps réel.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff5e6",
    theme_color: "#da693f",
    lang: "fr",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
