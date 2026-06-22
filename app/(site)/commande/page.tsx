"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, Store, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks/use-mounted";
import { getLivraisonSettings, createOrder } from "@/lib/data/api";
import { DEFAULT_LIVRAISON } from "@/lib/data/settings-default";
import type { LivraisonSettings, OrderType } from "@/lib/types";
import { Input, Textarea, Label } from "@/components/ui/input";
import { formatDh, cn } from "@/lib/utils";

export default function CommandePage() {
  const router = useRouter();
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const sousTotal = useCart((s) => s.sousTotal());
  const clear = useCart((s) => s.clear);

  const [settings, setSettings] = useState<LivraisonSettings>(DEFAULT_LIVRAISON);
  const [type, setType] = useState<OrderType>("livraison");
  const [quartier, setQuartier] = useState("");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [adresse, setAdresse] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLivraisonSettings().then((s) => {
      setSettings(s);
      setQuartier(s.quartiers[0]?.nom ?? "");
    });
  }, []);

  const frais = useMemo(() => {
    if (type === "emporter") return 0;
    const q = settings.quartiers.find((x) => x.nom === quartier);
    return q?.frais ?? settings.frais_par_defaut;
  }, [type, quartier, settings]);

  const total = sousTotal + frais;
  const sousMinimum = type === "livraison" && sousTotal < settings.minimum_commande;

  function validate(): string | null {
    if (!nom.trim()) return "Indiquez votre nom.";
    if (!/^[0-9+\s]{6,}$/.test(tel.trim())) return "Numéro de téléphone invalide.";
    if (type === "livraison") {
      if (!adresse.trim()) return "Indiquez votre adresse de livraison.";
      if (!quartier) return "Choisissez votre quartier.";
      if (sousMinimum)
        return `Minimum ${formatDh(settings.minimum_commande)} pour la livraison.`;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await createOrder({
        type,
        client_nom: nom.trim(),
        client_telephone: tel.trim(),
        adresse: type === "livraison" ? adresse.trim() : null,
        quartier: type === "livraison" ? quartier : null,
        notes: notes.trim() || null,
        sous_total: sousTotal,
        frais_livraison: frais,
        total,
        items: lines.map((l) => ({
          menu_item_id: l.itemId,
          nom: l.nom,
          quantite: l.quantite,
          prix_unitaire: l.prixUnitaire,
          options_choisies: l.optionsChoisies,
        })),
      });
      clear();
      router.push(`/suivi/${token}`);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Réessayez.");
      setSubmitting(false);
    }
  }

  if (!mounted) return <div className="mx-auto max-w-3xl px-6 py-20" aria-busy />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-ink">Votre panier est vide</h1>
        <Link
          href="/menu"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-6 font-medium text-cream hover:bg-terracotta-600"
        >
          Voir la carte
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-serif text-4xl text-ink">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Type */}
          <fieldset>
            <legend className="mb-3 font-serif text-xl text-ink">Mode de retrait</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { v: "livraison", label: "Livraison", icon: Bike, desc: "On vous livre" },
                  { v: "emporter", label: "À emporter", icon: Store, desc: "Vous passez chercher" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setType(opt.v)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-[var(--radius-lg)] border-2 p-4 text-left transition-colors",
                    type === opt.v
                      ? "border-terracotta bg-terracotta/5"
                      : "border-sand-deep hover:border-terracotta/40"
                  )}
                >
                  <opt.icon className={cn("h-5 w-5", type === opt.v ? "text-terracotta" : "text-ink-soft")} />
                  <span className="font-medium text-ink">{opt.label}</span>
                  <span className="text-xs text-ink-soft">{opt.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Livraison : quartier + adresse */}
          {type === "livraison" && (
            <fieldset className="space-y-4">
              <legend className="mb-1 font-serif text-xl text-ink">Adresse de livraison</legend>
              <div>
                <Label htmlFor="quartier">Quartier</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.quartiers.map((q) => (
                    <button
                      key={q.nom}
                      type="button"
                      onClick={() => setQuartier(q.nom)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        quartier === q.nom
                          ? "border-terracotta bg-terracotta/10 text-terracotta"
                          : "border-sand-deep text-ink-soft hover:border-terracotta/40"
                      )}
                    >
                      {q.nom} · {formatDh(q.frais)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="adresse">Adresse complète</Label>
                <Textarea
                  id="adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Rue, numéro, étage, points de repère…"
                />
              </div>
            </fieldset>
          )}

          {/* Coordonnées */}
          <fieldset className="space-y-4">
            <legend className="mb-1 font-serif text-xl text-ink">Vos coordonnées</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nom">Nom complet</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom" autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="tel">Téléphone</Label>
                <Input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="06 00 00 00 00" inputMode="tel" autoComplete="tel" />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Note pour la cuisine (optionnel)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, sans wasabi, baguettes en plus…" />
            </div>
            <p className="text-xs text-ink-soft">
              Pas besoin de compte : commandez en invité. Vous recevrez un lien de suivi.
            </p>
          </fieldset>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-5">
            <h2 className="font-serif text-xl text-ink">Votre commande</h2>
            <ul className="mt-3 max-h-56 space-y-2 overflow-auto text-sm">
              {lines.map((l) => (
                <li key={l.key} className="flex justify-between gap-2">
                  <span className="text-ink-soft">
                    {l.quantite}× {l.nom}
                  </span>
                  <span className="shrink-0 text-ink">{formatDh(l.prixUnitaire * l.quantite)}</span>
                </li>
              ))}
            </ul>
            <hr className="my-4 border-sand-deep" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Sous-total</dt>
                <dd className="text-ink">{formatDh(sousTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Livraison</dt>
                <dd className="text-ink">{type === "emporter" ? "—" : formatDh(frais)}</dd>
              </div>
              <div className="flex justify-between border-t border-sand-deep pt-2 text-base font-semibold">
                <dt className="text-ink">Total</dt>
                <dd className="text-terracotta">{formatDh(total)}</dd>
              </div>
            </dl>

            {sousMinimum && (
              <p className="mt-3 rounded-lg bg-ember/15 px-3 py-2 text-xs text-terracotta-700">
                Ajoutez {formatDh(settings.minimum_commande - sousTotal)} pour atteindre le minimum de livraison.
              </p>
            )}
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta font-medium text-cream hover:bg-terracotta-600 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
                </>
              ) : (
                <>
                  Confirmer la commande <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-ink-soft">
              Paiement à la livraison / au retrait (espèces).
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
