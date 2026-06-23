import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 n'exécute plus ESLint au build (le typage TypeScript strict reste vérifié).
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
