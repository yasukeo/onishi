import type { CategoryWithItems, MenuItem } from "./types";

/**
 * Seed du menu pour le MODE DÉMO (et miroir de supabase/migrations/0003_seed.sql).
 * ⚠️ RECONSTITUTION à partir de photos basse résolution du menu papier
 * (brief sections 5–6). À FAIRE VALIDER par le client avant mise en ligne.
 */

let _seq = 0;
function item(
  categorySlug: string,
  nom: string,
  prix: number,
  description: string | null,
  extra?: Partial<MenuItem>
): MenuItem {
  _seq += 1;
  return {
    id: `itm-${categorySlug}-${_seq}`,
    category_id: `cat-${categorySlug}`,
    nom,
    description,
    prix,
    photo_url: null,
    disponible: true,
    options: [],
    ordre_affichage: _seq,
    ...extra,
  };
}

const SAUCE_OPTION = {
  options: [{ nom: "Sauce", choix: ["Spicy mayo", "Sauce anguille", "Sans sauce"] }],
};

export const MENU: CategoryWithItems[] = [
  {
    id: "cat-onishi-deals",
    slug: "onishi-deals",
    nom: "Onishi Deals",
    ordre_affichage: 1,
    items: [
      item("onishi-deals", "Deal Saumon 25 pcs", 210, "6 California, 6 hosomaki saumon, nigiris, sushis"),
      item("onishi-deals", "Deal Oishi 20 pcs", 180, "California cream cheese, California avocat, nigiri saumon, crevette tempura"),
      item("onishi-deals", "Deal Tonno", 190, "Combo thon — composition à confirmer"),
    ],
  },
  {
    id: "cat-crunchy",
    slug: "crunchy",
    nom: "Crunchy",
    ordre_affichage: 2,
    items: [
      item("crunchy", "Crunchy Classic", 80, "Saumon, fromage, panure croustillante", SAUCE_OPTION),
      item("crunchy", "Crunchy Crevette", 95, "Crevette tempura, sauce épicée, panure croustillante", SAUCE_OPTION),
      item("crunchy", "Crunchy Spécial", 95, "Saumon, avocat, fromage, panure, sauce maison", SAUCE_OPTION),
    ],
  },
  {
    id: "cat-california",
    slug: "california",
    nom: "California",
    ordre_affichage: 3,
    items: [
      item("california", "California Saumon", 85, "Saumon, avocat, concombre, sésame"),
      item("california", "California Crevette", 85, "Crevette, avocat, concombre"),
      item("california", "California Cream Cheese", 80, "Saumon, cream cheese, ciboulette"),
    ],
  },
  {
    id: "cat-special-rolls",
    slug: "special-rolls",
    nom: "Special Rolls",
    ordre_affichage: 4,
    items: [
      item("special-rolls", "Roll Dragon", 110, "Crevette tempura, avocat, sauce anguille, tobiko"),
      item("special-rolls", "Roll Volcano", 115, "Saumon flambé, sauce épicée, oignons frits"),
    ],
  },
  {
    id: "cat-delice-rolls",
    slug: "delice-rolls",
    nom: "Delice Rolls",
    ordre_affichage: 5,
    items: [
      item("delice-rolls", "Delice Saumon", 100, "Saumon, fromage, sauce sucrée-épicée, fleurs comestibles"),
    ],
  },
  {
    id: "cat-boxes",
    slug: "boxes",
    nom: "Boxes",
    ordre_affichage: 6,
    items: [
      item("boxes", "Box Solo", 90, "12 pcs"),
      item("boxes", "Box Duo", 160, "24 pcs"),
    ],
  },
  {
    id: "cat-assortiments",
    slug: "assortiments",
    nom: "Assortiments",
    ordre_affichage: 7,
    items: [
      item("assortiments", "Assortiment Découverte", 130, "18 pcs — sélection du chef"),
    ],
  },
  {
    id: "cat-nigiris",
    slug: "nigiris",
    nom: "Nigiris",
    ordre_affichage: 8,
    items: [
      item("nigiris", "Nigiri Saumon", 18, "À la pièce"),
      item("nigiris", "Nigiri Thon", 22, "À la pièce"),
      item("nigiris", "Nigiri Crevette", 18, "À la pièce"),
    ],
  },
  {
    id: "cat-maki",
    slug: "maki",
    nom: "Maki",
    ordre_affichage: 9,
    items: [
      item("maki", "Maki Saumon", 45, "6 pcs"),
      item("maki", "Maki Avocat", 35, "6 pcs"),
    ],
  },
  {
    id: "cat-gunkan",
    slug: "gunkan",
    nom: "Gunkan",
    ordre_affichage: 10,
    items: [
      item("gunkan", "Gunkan Tobiko", 25, "Tobiko coloré"),
      item("gunkan", "Gunkan Saumon épicé", 28, "Saumon, sauce épicée"),
    ],
  },
  {
    id: "cat-sashimi",
    slug: "sashimi",
    nom: "Sashimi",
    ordre_affichage: 11,
    items: [
      item("sashimi", "Sashimi Saumon", 70, "6 pcs"),
      item("sashimi", "Sashimi Thon", 85, "6 pcs"),
    ],
  },
  {
    id: "cat-chirashi",
    slug: "chirashi",
    nom: "Chirashi",
    ordre_affichage: 12,
    items: [
      item("chirashi", "Chirashi Saumon", 95, "Bol de riz vinaigré, saumon, avocat, sésame"),
    ],
  },
  {
    id: "cat-tartares",
    slug: "tartares",
    nom: "Tartares",
    ordre_affichage: 13,
    items: [
      item("tartares", "Tartare Saumon Avocat", 75, "Saumon frais, avocat, assaisonnement maison"),
    ],
  },
  {
    id: "cat-boissons",
    slug: "boissons",
    nom: "Boissons",
    ordre_affichage: 14,
    items: [
      item("boissons", "Eau minérale", 15, "50 cl"),
      item("boissons", "Soda", 15, "Canette 33 cl"),
      item("boissons", "Thé glacé", 18, "Maison"),
    ],
  },
];

// ── Photos générées (Higgsfield, style maison) — public/plats/<slug>.png ──
// Pour la prod : remplacer par de vraies photos du restaurant (cf. README §Photos).
const PHOTOS: Record<string, string> = {
  "Deal Saumon 25 pcs": "deal-saumon",
  "Deal Oishi 20 pcs": "deal-oishi",
  "Deal Tonno": "deal-tonno",
  "Crunchy Classic": "crunchy-classic",
  "Crunchy Crevette": "crunchy-crevette",
  "Crunchy Spécial": "crunchy-special",
  "California Saumon": "california-saumon",
  "California Crevette": "california-crevette",
  "California Cream Cheese": "california-cream-cheese",
  "Roll Dragon": "roll-dragon",
  "Roll Volcano": "roll-volcano",
  "Delice Saumon": "delice-saumon",
  "Box Solo": "box-solo",
  "Box Duo": "box-duo",
  "Assortiment Découverte": "assortiment-decouverte",
  "Nigiri Saumon": "nigiri-saumon",
  "Nigiri Thon": "nigiri-thon",
  "Nigiri Crevette": "nigiri-crevette",
  "Maki Saumon": "maki-saumon",
  "Maki Avocat": "maki-avocat",
  "Gunkan Tobiko": "gunkan-tobiko",
  "Gunkan Saumon épicé": "gunkan-saumon-epice",
  "Sashimi Saumon": "sashimi-saumon",
  "Sashimi Thon": "sashimi-thon",
  "Chirashi Saumon": "chirashi-saumon",
  "Tartare Saumon Avocat": "tartare-saumon-avocat",
  "Eau minérale": "eau-minerale",
  Soda: "soda",
  "Thé glacé": "the-glace",
};

for (const cat of MENU) {
  for (const it of cat.items) {
    const slug = PHOTOS[it.nom];
    if (slug) it.photo_url = `/plats/${slug}.png`;
  }
}

export function findItem(id: string): MenuItem | undefined {
  for (const cat of MENU) {
    const found = cat.items.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}

export function findItemByName(nom: string): MenuItem | undefined {
  for (const cat of MENU) {
    const found = cat.items.find((i) => i.nom === nom);
    if (found) return found;
  }
  return undefined;
}

/** Quelques plats mis en avant sur l'accueil (par nom, robuste). */
export const SIGNATURE_NAME = "Roll Volcano";
export const FEATURED_NAMES = [
  "Roll Volcano",
  "Roll Dragon",
  "Crunchy Spécial",
  "Delice Saumon",
  "California Saumon",
  "Deal Saumon 25 pcs",
];
