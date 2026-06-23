"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clock, Loader2, CheckCircle2, XCircle, Copy, Phone, Timer } from "lucide-react";
import { getOrderByToken, subscribeOrders, addReview, getEtaSettings } from "@/lib/data/api";
import { DEFAULT_ETA } from "@/lib/data/settings-default";
import type { EtaSettings, OrderPublic, OrderStatus, OrderType } from "@/lib/types";
import { Stars } from "@/components/ui/stars";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDh, formatHeure, cn } from "@/lib/utils";

const STEPS: { statut: OrderStatus; label: (t: OrderType) => string }[] = [
  { statut: "nouvelle", label: () => "Commande reçue" },
  { statut: "confirmee", label: () => "Confirmée" },
  { statut: "en_preparation", label: () => "En préparation" },
  {
    statut: "en_livraison",
    label: (t) => (t === "emporter" ? "Prête à emporter" : "En livraison"),
  },
  { statut: "livree", label: (t) => (t === "emporter" ? "Récupérée" : "Livrée") },
];

export default function SuiviPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [order, setOrder] = useState<OrderPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [eta, setEta] = useState<EtaSettings>(DEFAULT_ETA);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    getEtaSettings().then(setEta);
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Heure d'arrivée estimée : création + préparation (+ livraison si applicable).
  const etaInfo = useMemo(() => {
    if (!order || order.statut === "livree" || order.statut === "annulee") return null;
    const minutes = eta.preparation_min + (order.type === "livraison" ? eta.livraison_min : 0);
    const target = new Date(order.creee_le).getTime() + minutes * 60000;
    return { target, remaining: Math.round((target - now) / 60000) };
  }, [order, eta, now]);

  async function submitReview() {
    if (note < 1) return;
    const ok = await addReview(token, note, commentaire.trim() || null);
    if (ok) setReviewSent(true);
  }

  const load = useCallback(async () => {
    const o = await getOrderByToken(token);
    setOrder(o);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
    return subscribeOrders(load);
  }, [load]);

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6" aria-busy>
        <div className="rounded-[var(--radius-xl)] border border-sand-deep bg-white/70 p-6 text-center">
          <Skeleton className="mx-auto h-14 w-14 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-8 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-64" />
        </div>
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-sand-deep bg-white/70 p-6">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <XCircle className="mx-auto h-12 w-12 text-ink-soft/50" />
        <h1 className="mt-4 font-serif text-3xl text-ink">Commande introuvable</h1>
        <p className="mt-2 text-ink-soft">Ce lien de suivi n&apos;est plus valide.</p>
        <Link href="/menu" className="mt-6 inline-flex h-12 items-center rounded-full bg-terracotta px-6 font-medium text-cream hover:bg-terracotta-600">
          Retour à la carte
        </Link>
      </div>
    );
  }

  const annulee = order.statut === "annulee";
  const currentIdx = STEPS.findIndex((s) => s.statut === order.statut);
  const eventAt = (s: OrderStatus) =>
    order.historique.find((h) => h.statut === s)?.horodatage;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Confirmation */}
      <div className="rounded-[var(--radius-xl)] border border-sand-deep bg-white/70 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-matcha/15">
          <CheckCircle2 className="h-8 w-8 text-matcha" />
        </div>
        <h1 className="mt-4 font-serif text-3xl text-ink">Merci, {order.client_nom.split(" ")[0]} !</h1>
        <p className="mt-1 text-ink-soft">
          Votre commande <span className="font-semibold text-ink">#{order.numero}</span> est bien
          enregistrée.
        </p>
        <button
          onClick={copyLink}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-sand-deep px-4 py-2 text-sm font-medium text-ink-soft hover:bg-sand"
        >
          {copied ? <Check className="h-4 w-4 text-matcha" /> : <Copy className="h-4 w-4" />}
          {copied ? "Lien copié" : "Copier le lien de suivi"}
        </button>
      </div>

      {/* Statut */}
      <div className="mt-6 rounded-[var(--radius-xl)] border border-sand-deep bg-white/70 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Clock className="h-5 w-5 text-terracotta" />
          <h2 className="font-serif text-xl text-ink">Suivi en temps réel</h2>
          {!annulee && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-matcha/10 px-2.5 py-1 text-xs font-medium text-matcha">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-matcha opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-matcha" />
              </span>
              En direct
            </span>
          )}
        </div>

        {!annulee && etaInfo && (
          <div className="mb-5 flex items-center gap-3 rounded-[var(--radius-lg)] border border-terracotta/30 bg-terracotta/5 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
              <Timer className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-ink-soft">
                {order.statut === "en_livraison"
                  ? order.type === "emporter" ? "Prête au retrait" : "Arrivée estimée"
                  : order.type === "emporter" ? "Prête au retrait vers" : "Livraison estimée vers"}
              </p>
              <p className="font-serif text-2xl leading-tight text-ink">
                {etaInfo.remaining > 1
                  ? `dans ~${etaInfo.remaining} min`
                  : "d'un instant à l'autre"}
                <span className="ml-2 text-base font-sans text-ink-soft">
                  (~{formatHeure(new Date(etaInfo.target))})
                </span>
              </p>
            </div>
          </div>
        )}

        {annulee ? (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
            <XCircle className="h-5 w-5" />
            <span>Cette commande a été annulée. Contactez-nous pour toute question.</span>
          </div>
        ) : (
          <ol className="relative space-y-1">
            {STEPS.map((step, i) => {
              const done = i < currentIdx;
              const current = i === currentIdx;
              const at = eventAt(step.statut);
              return (
                <li key={step.statut} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                        done && "border-matcha bg-matcha text-white",
                        current && "border-terracotta bg-terracotta text-cream",
                        !done && !current && "border-sand-deep bg-cream text-ink-soft/40"
                      )}
                    >
                      {done ? (
                        <Check className="h-4 w-4" />
                      ) : current ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="text-xs">{i + 1}</span>
                      )}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className={cn("my-1 w-0.5 flex-1 grow", done ? "bg-matcha" : "bg-sand-deep")} style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pb-4 pt-1">
                    <p className={cn("font-medium", current ? "text-terracotta" : done ? "text-ink" : "text-ink-soft/60")}>
                      {step.label(order.type)}
                    </p>
                    {at && <p className="text-xs text-ink-soft">{formatHeure(at)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Détail */}
      <div className="mt-6 rounded-[var(--radius-xl)] border border-sand-deep bg-white/70 p-6">
        <h2 className="font-serif text-xl text-ink">Détail</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {order.type === "livraison"
            ? `Livraison${order.quartier ? ` — ${order.quartier}` : ""}`
            : "À emporter"}
          {order.adresse ? ` · ${order.adresse}` : ""}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="text-ink-soft">
                {it.quantite}× {it.nom}
                {Object.keys(it.options_choisies).length > 0 && (
                  <span className="text-ink-soft/70">
                    {" "}
                    ({Object.values(it.options_choisies).join(", ")})
                  </span>
                )}
              </span>
              <span className="shrink-0 text-ink">{formatDh(it.prix_unitaire * it.quantite)}</span>
            </li>
          ))}
        </ul>
        <hr className="my-4 border-sand-deep" />
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Sous-total</dt>
            <dd className="text-ink">{formatDh(order.sous_total)}</dd>
          </div>
          {order.remise > 0 && (
            <div className="flex justify-between text-matcha">
              <dt>Remise</dt>
              <dd>-{formatDh(order.remise)}</dd>
            </div>
          )}
          {order.frais_livraison > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-soft">Livraison</dt>
              <dd className="text-ink">{formatDh(order.frais_livraison)}</dd>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <dt className="text-ink">Total</dt>
            <dd className="text-terracotta">{formatDh(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-sand px-3 py-2 text-xs text-ink-soft">
          <Phone className="h-3.5 w-3.5" /> Une question ? Appelez le restaurant, gardez votre
          numéro de commande #{order.numero} à portée de main.
        </p>
      </div>

      {/* Avis client — disponible une fois la commande livrée */}
      {order.statut === "livree" && (
        <div className="mt-6 rounded-[var(--radius-xl)] border border-sand-deep bg-white/70 p-6 text-center">
          {reviewSent ? (
            <>
              <CheckCircle2 className="mx-auto h-8 w-8 text-matcha" />
              <h2 className="mt-2 font-serif text-xl text-ink">Merci pour votre avis !</h2>
              <p className="text-sm text-ink-soft">Votre retour nous aide à nous améliorer.</p>
            </>
          ) : (
            <>
              <h2 className="font-serif text-xl text-ink">Comment était votre commande ?</h2>
              <div className="mt-3 flex justify-center">
                <Stars value={note} onChange={setNote} size={32} />
              </div>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Un mot sur votre expérience (optionnel)…"
                className="mx-auto mt-4 block min-h-[72px] w-full max-w-md rounded-[var(--radius)] border border-sand-deep px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
              />
              <button
                onClick={submitReview}
                disabled={note < 1}
                className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-6 font-medium text-cream hover:bg-terracotta-600 disabled:opacity-50"
              >
                Envoyer mon avis
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
