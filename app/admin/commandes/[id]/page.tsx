"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bike, Store, Phone, Clock, Printer, Loader2, XCircle, Check, User, MapPin,
} from "lucide-react";
import { getOrderById, updateOrderStatus, assignLivreur, updateOrderNote, listLivreurs, subscribeOrders } from "@/lib/data/api";
import type { OrderAdmin, OrderStatus, StaffUser } from "@/lib/types";
import { STATUS_LABEL, STATUS_FLOW } from "@/lib/types";
import { StatusBadge, nextStatus } from "@/components/admin/status";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { printHtml, ticketHtml } from "@/lib/print";
import { formatDh, formatDateHeure, formatHeure, cn } from "@/lib/utils";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const [order, setOrder] = useState<OrderAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [livreur, setLivreur] = useState("");
  const [livreurs, setLivreurs] = useState<StaffUser[]>([]);
  const [noteInterne, setNoteInterne] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const load = useCallback(async () => {
    const o = await getOrderById(id);
    setOrder(o);
    setLivreur(o?.livreur_id ?? "");
    setNoteInterne(o?.note_interne ?? "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    listLivreurs().then(setLivreurs);
    return subscribeOrders(load);
  }, [load]);

  async function setStatus(s: OrderStatus) {
    setBusy(true);
    await updateOrderStatus(id, s);
    await load();
    setBusy(false);
  }

  async function saveLivreur(value: string) {
    setLivreur(value);
    setBusy(true);
    await assignLivreur(id, value || null);
    await load();
    setBusy(false);
  }

  async function saveNote() {
    setBusy(true);
    await updateOrderNote(id, noteInterne.trim() || null);
    await load();
    setBusy(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1500);
  }

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center text-ink-soft">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="font-serif text-2xl text-ink">Commande introuvable</p>
        <Link href="/admin" className="mt-4 inline-block text-terracotta hover:underline">
          ← Retour au tableau
        </Link>
      </div>
    );
  }

  const next = nextStatus(order.statut);
  const canEdit = session ? can.editOrder(session.role) : false;

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink print:hidden">
        <ArrowLeft className="h-4 w-4" /> Tableau des commandes
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Détail (zone imprimable) */}
        <div id="ticket" className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl text-ink">Commande #{order.numero}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <Clock className="h-4 w-4" /> {formatDateHeure(order.creee_le)}
              </p>
            </div>
            <StatusBadge statut={order.statut} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-sand/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Client</p>
              <p className="mt-1 flex items-center gap-1.5 font-medium text-ink">
                <User className="h-4 w-4 text-terracotta" /> {order.client_nom}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                <Phone className="h-4 w-4 text-terracotta" /> {order.client_telephone}
              </p>
            </div>
            <div className="rounded-lg bg-sand/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                {order.type === "livraison" ? "Livraison" : "À emporter"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-medium text-ink">
                {order.type === "livraison" ? <Bike className="h-4 w-4 text-terracotta" /> : <Store className="h-4 w-4 text-terracotta" />}
                {order.type === "livraison" ? order.quartier ?? "—" : "Retrait sur place"}
              </p>
              {order.adresse && <p className="text-sm text-ink-soft">{order.adresse}</p>}
              {order.latitude != null && order.longitude != null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:underline print:hidden"
                >
                  <MapPin className="h-4 w-4" /> Itinéraire (position GPS)
                </a>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 rounded-lg border border-ember/40 bg-ember/10 p-3 text-sm text-ink">
              <span className="font-semibold">Note : </span>
              {order.notes}
            </div>
          )}

          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-sand-deep text-left text-ink-soft">
                <th className="py-2 font-medium">Article</th>
                <th className="py-2 text-center font-medium">Qté</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-b border-sand">
                  <td className="py-2 text-ink">
                    {it.nom}
                    {Object.keys(it.options_choisies).length > 0 && (
                      <span className="block text-xs text-ink-soft">
                        {Object.entries(it.options_choisies).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-center text-ink-soft">{it.quantite}</td>
                  <td className="py-2 text-right text-ink">{formatDh(it.prix_unitaire * it.quantite)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Sous-total</dt>
              <dd className="text-ink">{formatDh(order.sous_total)}</dd>
            </div>
            {order.remise > 0 && (
              <div className="flex justify-between text-matcha">
                <dt>Remise{order.code_promo ? ` (${order.code_promo})` : ""}</dt>
                <dd>-{formatDh(order.remise)}</dd>
              </div>
            )}
            {order.frais_livraison > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Livraison</dt>
                <dd className="text-ink">{formatDh(order.frais_livraison)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-sand-deep pt-1.5 text-base font-semibold">
              <dt className="text-ink">Total</dt>
              <dd className="text-terracotta">{formatDh(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink-soft">Paiement : espèces {order.type === "livraison" ? "à la livraison" : "au retrait"}.</p>
        </div>

        {/* Actions */}
        <div className="space-y-4 print:hidden">
          {canEdit && order.statut !== "annulee" && order.statut !== "livree" && (
            <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <h2 className="mb-3 font-semibold text-ink">Faire avancer</h2>
              {next && (
                <button
                  onClick={() => setStatus(next)}
                  disabled={busy}
                  className="mb-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-terracotta font-medium text-cream hover:bg-terracotta-600 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Passer à « {STATUS_LABEL[next]} »</>}
                </button>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    disabled={busy || s === order.statut}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-40",
                      s === order.statut ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-sand-deep text-ink-soft hover:bg-sand"
                    )}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {canEdit && (
            <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <h2 className="mb-2 font-semibold text-ink">Prévenir le client</h2>
              <WhatsappButton order={order} className="w-full" />
              <p className="mt-2 text-xs text-ink-soft">
                Ouvre WhatsApp avec un message pré-rempli (#{order.numero}, statut actuel, lien de suivi).
              </p>
            </div>
          )}

          {canEdit && order.type === "livraison" && (
            <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <h2 className="mb-2 font-semibold text-ink">Livreur assigné</h2>
              <select
                value={livreur}
                onChange={(e) => saveLivreur(e.target.value)}
                disabled={busy}
                className="h-10 w-full rounded-[var(--radius)] border border-sand-deep bg-white px-3 text-sm focus:border-terracotta focus:outline-none"
              >
                <option value="">— Non assigné —</option>
                {livreurs.map((l) => (
                  <option key={l.id} value={l.id}>{l.nom}</option>
                ))}
              </select>
              {livreurs.length === 0 && (
                <p className="mt-1.5 text-xs text-ink-soft">Aucun livreur. Ajoutez-en dans « Personnel ».</p>
              )}
            </div>
          )}

          {canEdit && (
            <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <h2 className="mb-2 font-semibold text-ink">Note interne</h2>
              <textarea
                value={noteInterne}
                onChange={(e) => setNoteInterne(e.target.value)}
                placeholder="Visible par l'équipe uniquement (ex. client VIP, rappeler…)"
                className="min-h-[72px] w-full rounded-[var(--radius)] border border-sand-deep px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
              />
              <button
                onClick={saveNote}
                disabled={busy}
                className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-full bg-charcoal px-3 text-sm font-medium text-cream hover:opacity-90"
              >
                {noteSaved ? <Check className="h-4 w-4" /> : null} {noteSaved ? "Enregistrée" : "Enregistrer la note"}
              </button>
            </div>
          )}

          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
            <button
              onClick={() => printHtml(ticketHtml(order))}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-sand-deep font-medium text-ink hover:bg-sand"
            >
              <Printer className="h-4 w-4" /> Imprimer le ticket
            </button>
            {canEdit && order.statut !== "annulee" && (
              <button
                onClick={() => {
                  if (confirm("Annuler cette commande ?")) setStatus("annulee");
                }}
                disabled={busy}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" /> Annuler la commande
              </button>
            )}
          </div>

          {/* Historique */}
          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
            <h2 className="mb-3 font-semibold text-ink">Historique</h2>
            <ol className="space-y-2">
              {order.historique.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-terracotta" />
                  <span className="text-ink">{STATUS_LABEL[h.statut]}</span>
                  <span className="ml-auto text-xs text-ink-soft">{formatHeure(h.horodatage)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
