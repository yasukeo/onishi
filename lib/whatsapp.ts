import type { OrderStatus, OrderType } from "./types";
import { SITE_URL } from "./site";

/**
 * Normalise un numéro marocain au format international sans « + » (requis par wa.me).
 * Ex. "0612-345-678" → "212612345678". Renvoie null si inexploitable.
 */
export function normalizePhoneMa(raw: string): string | null {
  let d = (raw || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("212")) {
    /* déjà international */
  } else if (d.startsWith("0")) {
    d = "212" + d.slice(1);
  } else if (d.length === 9) {
    d = "212" + d;
  }
  if (/^212\d{9}$/.test(d)) return d;
  return d.length >= 8 ? d : null; // numéro étranger saisi en entier : on tente
}

/** Lien de suivi public d'une commande. */
export function trackingUrl(token: string): string {
  return `${SITE_URL}/suivi/${token}`;
}

type OrderLike = {
  numero: number;
  client_nom: string;
  statut: OrderStatus;
  type: OrderType;
  token: string;
};

/** Message WhatsApp pré-rempli, adapté au statut courant de la commande. */
export function whatsappMessage(order: OrderLike): string {
  const prenom = order.client_nom?.trim().split(" ")[0] || "";
  const lien = trackingUrl(order.token);
  const n = order.numero;
  const bonjour = prenom ? `Bonjour ${prenom}` : "Bonjour";

  switch (order.statut) {
    case "nouvelle":
    case "confirmee":
      return `${bonjour} 👋, votre commande Onishi #${n} est bien confirmée ✅.\nSuivez-la en direct : ${lien}\nMerci pour votre confiance !`;
    case "en_preparation":
      return `${bonjour}, votre commande Onishi #${n} est en préparation 👨‍🍳.\nSuivi : ${lien}`;
    case "en_livraison":
      return order.type === "emporter"
        ? `${bonjour}, votre commande Onishi #${n} est prête à emporter 🥢 ! À tout de suite.`
        : `${bonjour}, votre commande Onishi #${n} est en route 🛵 !\nSuivi en direct : ${lien}`;
    case "livree":
      return `Merci ${prenom || ""} 🙏 ! Votre commande Onishi #${n} a bien été ${
        order.type === "emporter" ? "récupérée" : "livrée"
      }.\nVotre avis compte beaucoup pour nous : ${lien}`;
    case "annulee":
      return `${bonjour}, votre commande Onishi #${n} a été annulée. Contactez-nous pour toute question, nous restons à votre disposition.`;
    default:
      return `${bonjour}, au sujet de votre commande Onishi #${n} : ${lien}`;
  }
}

/** URL wa.me prête à ouvrir (null si le numéro est inexploitable). */
export function whatsappLink(phone: string, message: string): string | null {
  const p = normalizePhoneMa(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}
