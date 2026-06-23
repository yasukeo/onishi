// Constantes du site (SEO, données structurées). Surchargées par variables d'env.

/** URL publique du site (sans slash final). À définir en prod : NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://onishi.ma"
).replace(/\/$/, "");

/** Coordonnées & infos du restaurant (pour le JSON-LD Restaurant). */
export const RESTAURANT = {
  name: "Onishi — Authentic Sushi",
  description:
    "Sushi raffiné à Témara : rolls flambés, sashimi, chirashi et nos Onishi Deals. Commande en ligne, à emporter ou en livraison.",
  streetAddress: "Centre-ville", // à préciser avec le client
  locality: "Témara",
  region: "Rabat-Salé-Kénitra",
  postalCode: "12000",
  country: "MA",
  lat: 33.9407112,
  lng: -6.8984887,
  /** Renseigner NEXT_PUBLIC_RESTAURANT_PHONE en prod (sinon omis du JSON-LD). */
  phone: process.env.NEXT_PUBLIC_RESTAURANT_PHONE || "",
  priceRange: "$$",
  cuisines: ["Japonais", "Sushi"],
  /** Format schema.org openingHours (Mardi fermé, sinon 12h→minuit). */
  openingHours: ["Mo 12:00-23:59", "We-Su 12:00-23:59"],
};
