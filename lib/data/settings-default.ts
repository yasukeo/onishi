import type { LivraisonSettings } from "../types";

/** Réglages livraison par défaut (miroir de 0003_seed.sql). Modifiables en admin. */
export const DEFAULT_LIVRAISON: LivraisonSettings = {
  frais_par_defaut: 15,
  minimum_commande: 80,
  quartiers: [
    { nom: "Témara Centre", frais: 10 },
    { nom: "Massira", frais: 15 },
    { nom: "Wifak", frais: 15 },
    { nom: "Harhoura", frais: 20 },
    { nom: "Guich Oudaya", frais: 20 },
  ],
};

export const HORAIRES_TEXTE =
  "Tous les jours de 12h à minuit — fermé le mardi";
