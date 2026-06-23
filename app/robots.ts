import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'espace équipe ne doit jamais être indexé.
      disallow: ["/admin", "/suivi"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
