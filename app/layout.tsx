import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Onishi — Authentic Sushi · Témara",
    template: "%s · Onishi",
  },
  description:
    "Sushi raffiné à Témara. Commandez en ligne, à emporter ou en livraison. Rolls flambés, sashimi, chirashi et nos Onishi Deals.",
  icons: { icon: "/logo.webp" },
  openGraph: {
    title: "Onishi — Authentic Sushi",
    description: "Sushi raffiné à Témara. Commande en ligne, livraison & à emporter.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#da693f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
