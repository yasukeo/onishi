import type { DayHoraire, HorairesSettings, ServiceStatus } from "./types";

/** "HH:MM" → minutes depuis minuit. */
function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

/** Jour courant (0=Lundi … 6=Dimanche) à partir d'une Date locale. */
function planIndex(d: Date): number {
  return (d.getDay() + 6) % 7; // getDay : 0=dimanche
}

/** Le créneau du jour est-il ouvert à l'instant `at` ? */
export function isWithinDay(day: DayHoraire | undefined, at: Date): boolean {
  if (!day || !day.ouvert) return false;
  const now = at.getHours() * 60 + at.getMinutes();
  const ouvre = toMin(day.ouvre || "00:00");
  let ferme = toMin(day.ferme || "23:59");
  if (ferme === 0) ferme = 1440; // 00:00 = minuit (fin de journée)
  return ferme <= ouvre
    ? now >= ouvre || now < ferme // à cheval sur minuit
    : now >= ouvre && now < ferme;
}

export interface ServiceState {
  open: boolean;
  /** Message à afficher quand c'est fermé. */
  message: string;
  /** "12:00" — prochaine ouverture si connue (pour les messages). */
  prochaineOuverture?: string;
  /** Vrai si la fermeture vient du planning (≠ pause manuelle). */
  autoFerme: boolean;
}

/**
 * État de service combiné : la pause manuelle (`service.ouvert = false`) prime,
 * sinon on suit le planning hebdomadaire. Sans planning configuré → toujours ouvert.
 */
export function computeServiceState(
  service: ServiceStatus,
  horaires: HorairesSettings,
  at: Date = new Date()
): ServiceState {
  if (!service.ouvert) {
    return {
      open: false,
      message: service.message || "Service en pause — nous ne prenons pas de commande pour le moment.",
      autoFerme: false,
    };
  }

  const planning = horaires.planning;
  if (!planning || planning.length !== 7) {
    return { open: true, message: "", autoFerme: false };
  }

  const idx = planIndex(at);
  const day = planning[idx];
  if (isWithinDay(day, at)) {
    return { open: true, message: "", autoFerme: false };
  }

  // Fermé : on cherche la prochaine ouverture (aujourd'hui plus tard, sinon jours suivants).
  let prochaine: string | undefined;
  for (let i = 0; i < 7; i++) {
    const d = planning[(idx + i) % 7];
    if (d?.ouvert) {
      if (i === 0) {
        const now = at.getHours() * 60 + at.getMinutes();
        if (now < toMin(d.ouvre)) {
          prochaine = `aujourd'hui à ${d.ouvre}`;
          break;
        }
      } else {
        prochaine = `${i === 1 ? "demain" : d.jour.toLowerCase()} à ${d.ouvre}`;
        break;
      }
    }
  }

  return {
    open: false,
    message: prochaine
      ? `Restaurant fermé — réouverture ${prochaine}.`
      : "Restaurant fermé actuellement.",
    prochaineOuverture: prochaine,
    autoFerme: true,
  };
}
