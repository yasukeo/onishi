import type { StaffRole } from "./types";

// ════════════════════════════════════════════════════════════════════
// Contrôle d'accès par rôle (source unique de vérité).
//   admin   (Gérant)  : tout
//   employe (Cuisine)  : commandes + cuisine + suivi (pas la config)
//   livreur (Livreur)  : UNIQUEMENT les livraisons
// ════════════════════════════════════════════════════════════════════

const ALL: StaffRole[] = ["admin", "employe", "livreur"];

/** Accès aux routes admin (le préfixe le plus spécifique gagne). */
const ROUTE_ROLES: { prefix: string; roles: StaffRole[] }[] = [
  { prefix: "/admin/cuisine", roles: ["admin", "employe"] },
  { prefix: "/admin/livraisons", roles: ["admin", "livreur"] },
  { prefix: "/admin/historique", roles: ["admin", "employe"] },
  { prefix: "/admin/jour", roles: ["admin", "employe"] },
  { prefix: "/admin/stats", roles: ["admin"] },
  { prefix: "/admin/clients", roles: ["admin"] },
  { prefix: "/admin/avis", roles: ["admin", "employe"] },
  { prefix: "/admin/menu", roles: ["admin"] },
  { prefix: "/admin/promos", roles: ["admin"] },
  { prefix: "/admin/personnel", roles: ["admin"] },
  { prefix: "/admin/reglages", roles: ["admin"] },
  // Détail commande : consultable par tous, l'édition est bridée dans la page.
  { prefix: "/admin/commandes", roles: ALL },
  // Dashboard kanban : pas le livreur (il a sa vue Livraisons dédiée).
  { prefix: "/admin", roles: ["admin", "employe"] },
];

export function canAccess(pathname: string, role: StaffRole): boolean {
  const match = [...ROUTE_ROLES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));
  return match ? match.roles.includes(role) : true;
}

/** Page d'accueil de l'espace équipe selon le rôle. */
export function homeFor(role: StaffRole): string {
  return role === "livreur" ? "/admin/livraisons" : "/admin";
}

/** Capacités d'action (utilisées dans les pages pour afficher/masquer). */
export const can = {
  /** Faire avancer une commande dans le flux cuisine (confirmer, préparer…). */
  advanceKitchen: (r: StaffRole) => r === "admin" || r === "employe",
  /** Marquer une livraison en route / livrée. */
  deliver: (r: StaffRole) => r === "admin" || r === "livreur",
  /** Annuler une commande. */
  cancel: (r: StaffRole) => r === "admin" || r === "employe",
  /** Éditer une commande (statut, livreur, note interne). */
  editOrder: (r: StaffRole) => r === "admin" || r === "employe",
  /** Accès à la configuration (menu, promos, personnel, réglages). */
  manage: (r: StaffRole) => r === "admin",
};
