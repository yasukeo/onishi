import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate un prix en dirhams marocains, sans décimales superflues. */
export function formatDh(montant: number): string {
  const n = Number.isFinite(montant) ? montant : 0;
  const arrondi = Math.round(n * 100) / 100;
  const affiche = Number.isInteger(arrondi) ? arrondi.toString() : arrondi.toFixed(2);
  return `${affiche} dh`;
}

/** Horodatage court FR (ex. "14:32"). */
export function formatHeure(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** Date + heure FR. */
export function formatDateHeure(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Temps relatif simple ("il y a 3 min"). */
export function depuis(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  return `il y a ${j} j`;
}
