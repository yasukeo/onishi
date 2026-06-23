import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { PwaSetup } from "@/components/pwa";
import { SITE_URL } from "@/lib/site";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Onishi — Authentic Sushi · Témara",
    template: "%s · Onishi",
  },
  description:
    "Sushi raffiné à Témara. Commandez en ligne, à emporter ou en livraison. Rolls flambés, sashimi, chirashi et nos Onishi Deals.",
  applicationName: "Onishi",
  icons: { icon: "/logo.webp", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "Onishi", statusBarStyle: "default" },
  openGraph: {
    title: "Onishi — Authentic Sushi",
    description: "Sushi raffiné à Témara. Commande en ligne, livraison & à emporter.",
    url: SITE_URL,
    siteName: "Onishi",
    locale: "fr_MA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onishi — Authentic Sushi",
    description: "Sushi raffiné à Témara. Commande en ligne, livraison & à emporter.",
  },
};

export const viewport: Viewport = {
  themeColor: "#da693f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // gère les encoches (safe-area) en mode app
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        {children}
        <PwaSetup />
      </body>
    </html>
  );
}
