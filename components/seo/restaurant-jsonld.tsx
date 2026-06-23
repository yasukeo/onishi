import { RESTAURANT, SITE_URL } from "@/lib/site";

/** Données structurées schema.org/Restaurant (rich results Google + partages). */
export function RestaurantJsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: RESTAURANT.name,
    description: RESTAURANT.description,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    servesCuisine: RESTAURANT.cuisines,
    priceRange: RESTAURANT.priceRange,
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      streetAddress: RESTAURANT.streetAddress,
      addressLocality: RESTAURANT.locality,
      addressRegion: RESTAURANT.region,
      postalCode: RESTAURANT.postalCode,
      addressCountry: RESTAURANT.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: RESTAURANT.lat,
      longitude: RESTAURANT.lng,
    },
    openingHours: RESTAURANT.openingHours,
    hasMenu: `${SITE_URL}/menu`,
  };
  if (RESTAURANT.phone) data.telephone = RESTAURANT.phone;

  return (
    <script
      type="application/ld+json"
      // JSON statique généré côté serveur — pas de donnée utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
