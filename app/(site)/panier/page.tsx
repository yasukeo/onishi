"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks/use-mounted";
import { DishImage } from "@/components/site/dish-image";
import { formatDh } from "@/lib/utils";

export default function PanierPage() {
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const sousTotal = useCart((s) => s.sousTotal());

  if (!mounted) {
    return <div className="mx-auto max-w-3xl px-6 py-20" aria-busy />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand">
          <ShoppingBag className="h-7 w-7 text-terracotta" />
        </div>
        <h1 className="mt-5 font-serif text-3xl text-ink">Votre panier est vide</h1>
        <p className="mt-2 text-ink-soft">Parcourez la carte et composez votre commande.</p>
        <Link
          href="/menu"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-terracotta px-6 font-medium text-cream hover:bg-terracotta-600"
        >
          Voir la carte <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-serif text-4xl text-ink">Votre panier</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {lines.map((line) => {
            const opts = Object.entries(line.optionsChoisies);
            return (
              <li
                key={line.key}
                className="flex gap-4 rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-3"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius)]">
                  <DishImage src={line.photoUrl} alt={line.nom} className="h-full w-full" />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-ink">{line.nom}</h3>
                      {opts.length > 0 && (
                        <p className="text-xs text-ink-soft">
                          {opts.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm text-ink-soft">{formatDh(line.prixUnitaire)}</p>
                    </div>
                    <button
                      onClick={() => remove(line.key)}
                      className="rounded-full p-2 text-ink-soft hover:bg-sand hover:text-red-600"
                      aria-label={`Retirer ${line.nom}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 rounded-full border border-sand-deep">
                      <button
                        onClick={() => decrement(line.key)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-sand"
                        aria-label="Diminuer"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{line.quantite}</span>
                      <button
                        onClick={() => increment(line.key)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-sand"
                        aria-label="Augmenter"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-ink">
                      {formatDh(line.prixUnitaire * line.quantite)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-5">
            <h2 className="font-serif text-xl text-ink">Récapitulatif</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Sous-total</dt>
                <dd className="font-medium text-ink">{formatDh(sousTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Livraison</dt>
                <dd className="text-ink-soft">calculée à l&apos;étape suivante</dd>
              </div>
            </dl>
            <Link
              href="/commande"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta font-medium text-cream hover:bg-terracotta-600"
            >
              Passer la commande <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/menu"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-medium text-ink-soft hover:bg-sand"
            >
              Continuer mes achats
            </Link>
            <p className="mt-4 text-center text-xs text-ink-soft">
              Paiement à la livraison ou au retrait (espèces).
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
