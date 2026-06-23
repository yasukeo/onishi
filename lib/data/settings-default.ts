import type {
  DayHoraire,
  EtaSettings,
  HorairesSettings,
  LivraisonSettings,
  ServiceStatus,
} from "../types";

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

/** Planning par défaut : 12h→minuit tous les jours, fermé le mardi. */
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const DEFAULT_PLANNING: DayHoraire[] = JOURS.map((jour) => ({
  jour,
  ouvert: jour !== "Mardi",
  ouvre: "12:00",
  ferme: "00:00",
}));

export const DEFAULT_HORAIRES: HorairesSettings = {
  texte: "Tous les jours de 12h à minuit — fermé le mardi",
  ferme_le: "mardi",
  planning: DEFAULT_PLANNING,
};

export const DEFAULT_SERVICE: ServiceStatus = {
  ouvert: true,
  message: "",
};

export const DEFAULT_ETA: EtaSettings = {
  preparation_min: 25,
  livraison_min: 20,
};

export const HORAIRES_TEXTE = DEFAULT_HORAIRES.texte;
