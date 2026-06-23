"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X, Sparkles } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useCartUI } from "@/lib/store/cart-ui";
import { useMenu } from "@/lib/hooks/use-menu";
import { useMounted } from "@/lib/hooks/use-mounted";
import { DishImage } from "./dish-image";
import { formatDh } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function CartDrawer() {
  const mounted = useMounted();
  const open = useCartUI((s) => s.open);
  const close = useCartUI((s) => s.closeCart);
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const add = useCart((s) => s.add);
  const sousTotal = useCart((s) => s.sousTotal());
  const { menu } = useMenu();
  const panelRef = useRef<HTMLDivElement>(null);

  // Suggestions : boissons (ou plats abordables) absentes du panier.
  const upsell = useMemo<MenuItem[]>(() => {
    const inCart = new Set(lines.map((l) => l.itemId));
    const boissons = menu.find(
      (c) => /boisson|drink|dessert/i.test(c.nom) || /boisson|drink|dessert/i.test(c.slug)
    );
    const pool = boissons
      ? boissons.items
      : menu.flatMap((c) => c.items).filter((i) => i.prix <= 35);
    return pool.filter((i) => i.disponible && !inCart.has(i.id)).slice(0, 6);
  }, [menu, lines]);

  // Fermeture au clavier + verrouillage du défilement de fond.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={close}
            aria-label="Fermer le panier"
            tabIndex={-1}
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Votre panier"
            className="absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col bg-cream shadow-2xl outline-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-sand-deep px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
                <ShoppingBag className="h-5 w-5 text-terracotta" /> Votre panier
              </h2>
              <button
                onClick={close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-sand"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand">
                  <ShoppingBag className="h-7 w-7 text-terracotta" />
                </div>
                <p className="font-serif text-2xl text-ink">Votre panier est vide</p>
                <Link
                  href="/menu"
                  onClick={close}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-terracotta px-6 font-medium text-cream hover:bg-terracotta-600"
                >
                  Voir la carte <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Lignes */}
                <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {lines.map((line) => {
                    const opts = Object.entries(line.optionsChoisies);
                    return (
                      <li key={line.key} className="flex gap-3 rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 p-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius)]">
                          <DishImage src={line.photoUrl} alt={line.nom} className="h-full w-full" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-medium text-ink">{line.nom}</h3>
                              {opts.length > 0 && (
                                <p className="truncate text-xs text-ink-soft">
                                  {opts.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                                </p>
                              )}
                              <p className="mt-0.5 text-xs text-ink-soft">{formatDh(line.prixUnitaire)}</p>
                            </div>
                            <button
                              onClick={() => remove(line.key)}
                              className="rounded-full p-1.5 text-ink-soft hover:bg-sand hover:text-red-600"
                              aria-label={`Retirer ${line.nom}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-1.5">
                            <div className="flex items-center gap-1 rounded-full border border-sand-deep">
                              <button onClick={() => decrement(line.key)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-sand" aria-label="Diminuer">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-5 text-center text-sm font-medium">{line.quantite}</span>
                              <button onClick={() => increment(line.key)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-sand" aria-label="Augmenter">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-ink">{formatDh(line.prixUnitaire * line.quantite)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}

                  {/* Upsell */}
                  {upsell.length > 0 && (
                    <li className="pt-2">
                      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                        <Sparkles className="h-4 w-4 text-ember" /> Avec ça ?
                      </p>
                      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                        {upsell.map((it, i) => (
                          <button
                            key={it.id}
                            onClick={() => add(it, Object.fromEntries(it.options.map((o) => [o.nom, o.choix[0]])))}
                            className="group w-28 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 text-left transition-shadow hover:shadow-md"
                          >
                            <div className="relative aspect-square w-full overflow-hidden">
                              <DishImage src={it.photo_url} alt={it.nom} seed={i} className="h-full w-full" />
                              <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-cream shadow">
                                <Plus className="h-4 w-4" />
                              </span>
                            </div>
                            <div className="p-2">
                              <p className="truncate text-xs font-medium text-ink">{it.nom}</p>
                              <p className="text-xs text-terracotta">{formatDh(it.prix)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </li>
                  )}
                </ul>

                {/* Pied : total + CTA */}
                <div className="border-t border-sand-deep bg-cream px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Sous-total</span>
                    <span className="font-serif text-xl text-ink">{formatDh(sousTotal)}</span>
                  </div>
                  <Link
                    href="/commande"
                    onClick={close}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracotta font-medium text-cream hover:bg-terracotta-600"
                  >
                    Passer la commande <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/panier"
                    onClick={close}
                    className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-full text-sm font-medium text-ink-soft hover:bg-sand"
                  >
                    Voir le panier complet
                  </Link>
                  <p className="mt-2 text-center text-xs text-ink-soft">Paiement à la livraison / au retrait (espèces).</p>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
