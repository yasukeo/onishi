// Types partagés — alignés sur le schéma Supabase (supabase/migrations).

export type OrderStatus =
  | "nouvelle"
  | "confirmee"
  | "en_preparation"
  | "en_livraison"
  | "livree"
  | "annulee";

export type OrderType = "livraison" | "emporter";

export type StaffRole = "admin" | "employe" | "livreur";

export interface MenuItemOption {
  nom: string;
  choix: string[];
}

export interface MenuItem {
  id: string;
  category_id: string;
  nom: string;
  description: string | null;
  prix: number;
  photo_url: string | null;
  disponible: boolean;
  options: MenuItemOption[];
  ordre_affichage: number;
}

export interface Category {
  id: string;
  slug: string;
  nom: string;
  ordre_affichage: number;
}

export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

export interface CartLine {
  /** clé unique de ligne (item + options choisies) */
  key: string;
  itemId: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  optionsChoisies: Record<string, string>;
  photoUrl: string | null;
}

export interface OrderItemInput {
  menu_item_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  options_choisies: Record<string, string>;
}

export interface CreateOrderInput {
  type: OrderType;
  client_nom: string;
  client_telephone: string;
  adresse: string | null;
  quartier: string | null;
  notes: string | null;
  sous_total: number;
  frais_livraison: number;
  total: number;
  items: OrderItemInput[];
}

export interface OrderItem {
  nom: string;
  quantite: number;
  prix_unitaire: number;
  options_choisies: Record<string, string>;
}

export interface StatusEvent {
  statut: OrderStatus;
  horodatage: string;
}

/** Vue "suivi client" (renvoyée par get_order_by_token / mode démo). */
export interface OrderPublic {
  id: string;
  numero: number;
  statut: OrderStatus;
  type: OrderType;
  client_nom: string;
  adresse: string | null;
  quartier: string | null;
  sous_total: number;
  frais_livraison: number;
  total: number;
  creee_le: string;
  maj_le: string;
  items: OrderItem[];
  historique: StatusEvent[];
}

/** Vue "admin" complète d'une commande. */
export interface OrderAdmin extends OrderPublic {
  token: string;
  client_telephone: string;
  notes: string | null;
  livreur_id: string | null;
}

export interface Quartier {
  nom: string;
  frais: number;
}

export interface LivraisonSettings {
  frais_par_defaut: number;
  minimum_commande: number;
  quartiers: Quartier[];
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  en_livraison: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
};

/** Flux normal d'avancement (sert au bouton "étape suivante" admin). */
export const STATUS_FLOW: OrderStatus[] = [
  "nouvelle",
  "confirmee",
  "en_preparation",
  "en_livraison",
  "livree",
];
