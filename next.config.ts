import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La maquette ne fournit pas de config ESLint dédiée : on n'échoue pas le
  // build dessus (le typage TypeScript strict reste, lui, vérifié).
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      // Photos hébergées sur Supabase Storage (production)
      { protocol: "https", hostname: "*.supabase.co" },
      // Visuels générés (Higgsfield / Cloudinary) pour la maquette
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.higgsfield.ai" },
    ],
  },
};

export default nextConfig;
