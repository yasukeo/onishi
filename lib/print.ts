"use client";

import type { OrderAdmin } from "./types";
import { formatDh, formatDateHeure } from "./utils";

/** Imprime un fragment HTML via un iframe caché (n'imprime pas toute la page). */
export function printHtml(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Onishi</title>
    <style>
      *{font-family:ui-monospace,Menlo,Consolas,monospace;color:#000}
      body{margin:0;padding:12px;width:280px}
      h1{font-size:16px;margin:0 0 2px} .muted{color:#444;font-size:11px}
      hr{border:none;border-top:1px dashed #999;margin:8px 0}
      table{width:100%;border-collapse:collapse;font-size:12px}
      td{padding:2px 0;vertical-align:top} .r{text-align:right} .c{text-align:center}
      .tot{font-weight:700;font-size:14px} .center{text-align:center}
    </style></head><body>${html}</body></html>`);
  doc.close();
  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1500);
  }, 350);
}

/** Ticket cuisine/caisse d'une commande. */
export function ticketHtml(o: OrderAdmin): string {
  const lignes = o.items
    .map((it) => {
      const opts = Object.keys(it.options_choisies).length
        ? `<div class="muted">${Object.values(it.options_choisies).join(", ")}</div>`
        : "";
      return `<tr><td>${it.quantite}× ${it.nom}${opts}</td><td class="r">${formatDh(
        it.prix_unitaire * it.quantite
      )}</td></tr>`;
    })
    .join("");
  return `
    <div class="center"><h1>ONISHI</h1><div class="muted">Authentic Sushi · Témara</div></div>
    <hr>
    <div><strong>Commande #${o.numero}</strong></div>
    <div class="muted">${formatDateHeure(o.creee_le)}</div>
    <div>${o.type === "livraison" ? "LIVRAISON" : "À EMPORTER"}${o.quartier ? " · " + o.quartier : ""}</div>
    <div>${o.client_nom} · ${o.client_telephone}</div>
    ${o.adresse ? `<div class="muted">${o.adresse}</div>` : ""}
    ${o.notes ? `<div>Note: ${o.notes}</div>` : ""}
    <hr>
    <table>${lignes}</table>
    <hr>
    <table>
      <tr><td>Sous-total</td><td class="r">${formatDh(o.sous_total)}</td></tr>
      ${o.remise ? `<tr><td>Remise${o.code_promo ? " (" + o.code_promo + ")" : ""}</td><td class="r">-${formatDh(o.remise)}</td></tr>` : ""}
      ${o.frais_livraison ? `<tr><td>Livraison</td><td class="r">${formatDh(o.frais_livraison)}</td></tr>` : ""}
      <tr class="tot"><td>TOTAL</td><td class="r">${formatDh(o.total)}</td></tr>
    </table>
    <hr>
    <div class="center muted">Paiement espèces ${o.type === "livraison" ? "à la livraison" : "au retrait"}<br>Merci !</div>
  `;
}

/** Clôture de caisse : récapitulatif d'une journée. */
export function cashCloseHtml(opts: {
  date: string;
  nbCommandes: number;
  ca: number;
  livraisons: number;
  emporter: number;
  annulees: number;
  panierMoyen: number;
}): string {
  return `
    <div class="center"><h1>ONISHI</h1><div class="muted">Clôture de caisse</div></div>
    <hr>
    <div><strong>${opts.date}</strong></div>
    <hr>
    <table>
      <tr><td>Commandes</td><td class="r">${opts.nbCommandes}</td></tr>
      <tr><td>Livraisons</td><td class="r">${opts.livraisons}</td></tr>
      <tr><td>À emporter</td><td class="r">${opts.emporter}</td></tr>
      <tr><td>Annulées</td><td class="r">${opts.annulees}</td></tr>
      <tr><td>Panier moyen</td><td class="r">${formatDh(opts.panierMoyen)}</td></tr>
    </table>
    <hr>
    <table><tr class="tot"><td>TOTAL ENCAISSÉ</td><td class="r">${formatDh(opts.ca)}</td></tr></table>
    <hr>
    <div class="center muted">Espèces — paiement à la livraison/au retrait</div>
  `;
}
