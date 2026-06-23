"use client";

import Link from "next/link";
import { Loader2, TrendingUp, ShoppingBag, Bike, Store, Ban, Printer } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { StatusBadge } from "@/components/admin/status";
import { printHtml, cashCloseHtml } from "@/lib/print";
import { formatDh, formatHeure } from "@/lib/utils";

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export default function JourPage() {
  const { orders, loading } = useOrders();
  const today = orders.filter((o) => isToday(o.creee_le));
  const valides = today.filter((o) => o.statut !== "annulee");

  const ca = valides.reduce((s, o) => s + o.total, 0);
  const panierMoyen = valides.length ? ca / valides.length : 0;
  const livraisons = valides.filter((o) => o.type === "livraison").length;
  const emporter = valides.filter((o) => o.type === "emporter").length;
  const annulees = today.filter((o) => o.statut === "annulee").length;

  const stats = [
    { label: "Chiffre du jour", value: formatDh(ca), icon: TrendingUp },
    { label: "Commandes", value: valides.length.toString(), icon: ShoppingBag },
    { label: "Panier moyen", value: formatDh(panierMoyen), icon: TrendingUp },
    { label: "Annulées", value: annulees.toString(), icon: Ban },
  ];

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Vue du jour</h1>
          <p className="text-sm text-ink-soft">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          onClick={() =>
            printHtml(
              cashCloseHtml({
                date: new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
                nbCommandes: valides.length,
                ca,
                livraisons,
                emporter,
                annulees,
                panierMoyen,
              })
            )
          }
          className="inline-flex h-10 items-center gap-2 rounded-full border border-sand-deep px-4 text-sm font-medium text-ink hover:bg-sand"
        >
          <Printer className="h-4 w-4" /> Clôture de caisse
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-soft">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
                <s.icon className="h-5 w-5 text-terracotta" />
                <p className="mt-2 text-2xl font-semibold text-ink">{s.value}</p>
                <p className="text-xs text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4f7d8a]/15 text-[#4f7d8a]">
                <Bike className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-ink">{livraisons}</p>
                <p className="text-xs text-ink-soft">Livraisons</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-ink">{emporter}</p>
                <p className="text-xs text-ink-soft">À emporter</p>
              </div>
            </div>
          </div>

          <h2 className="mb-3 mt-8 font-serif text-xl text-ink">Commandes du jour</h2>
          {today.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-sand-deep py-12 text-center text-sm text-ink-soft">
              Aucune commande aujourd&apos;hui.
            </p>
          ) : (
            <ul className="divide-y divide-sand-deep overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white">
              {today.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/commandes/${o.id}`} className="flex items-center gap-3 p-3 hover:bg-sand/50">
                    <span className="font-semibold text-ink">#{o.numero}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                      {o.client_nom} · {o.type === "livraison" ? "Livraison" : "Emporter"}
                    </span>
                    <span className="hidden text-xs text-ink-soft sm:inline">{formatHeure(o.creee_le)}</span>
                    <StatusBadge statut={o.statut} />
                    <span className="w-20 text-right font-medium text-ink">{formatDh(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
