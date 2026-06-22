"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { useMenu } from "@/lib/hooks/use-menu";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks/use-mounted";
import { MenuItemCard } from "@/components/site/menu-item-card";
import { Input } from "@/components/ui/input";
import { formatDh, cn } from "@/lib/utils";

export default function MenuPage() {
  const { menu, loading } = useMenu();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("");

  const mounted = useMounted();
  const count = useCart((s) => s.count());
  const sousTotal = useCart((s) => s.sousTotal());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu
      .map((cat) => ({
        ...cat,
        items: q
          ? cat.items.filter(
              (i) =>
                i.nom.toLowerCase().includes(q) ||
                (i.description ?? "").toLowerCase().includes(q)
            )
          : cat.items,
      }))
      .filter((cat) => cat.items.length > 0);
  }, [menu, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6">
      <header className="mb-6">
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">La carte</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Tous nos plats, préparés à la commande. Sélectionnez et ajoutez à votre panier.
        </p>
      </header>

      {/* Recherche */}
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un plat…"
          className="pl-10"
          aria-label="Rechercher un plat"
        />
      </div>

      {/* Nav catégories sticky */}
      {!loading && (
        <nav className="no-scrollbar sticky top-16 z-30 -mx-4 mb-8 flex gap-2 overflow-x-auto border-b border-sand-deep/60 bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:px-3">
          {filtered.map((cat) => (
            <a
              key={cat.id}
              href={`#cat-${cat.slug}`}
              onClick={() => setActive(cat.slug)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                active === cat.slug
                  ? "bg-terracotta text-cream"
                  : "bg-sand text-ink-soft hover:bg-sand-deep"
              )}
            >
              {cat.nom}
            </a>
          ))}
        </nav>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-[var(--radius-lg)] bg-sand" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">Aucun plat ne correspond à « {query} ».</p>
      ) : (
        <div className="space-y-14">
          {filtered.map((cat, ci) => (
            <section key={cat.id} id={`cat-${cat.slug}`} className="scroll-mt-32">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">{cat.nom}</h2>
                <span className="h-px flex-1 bg-sand-deep" />
                <span className="text-sm text-ink-soft">{cat.items.length}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item, i) => (
                  <MenuItemCard key={item.id} item={item} seed={ci + i} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Barre panier flottante (mobile + desktop) */}
      {mounted && count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-deep bg-cream/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="text-sm">
              <span className="font-semibold text-ink">{count} article{count > 1 ? "s" : ""}</span>
              <span className="text-ink-soft"> · {formatDh(sousTotal)}</span>
            </div>
            <Link
              href="/panier"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-terracotta px-6 font-medium text-cream hover:bg-terracotta-600"
            >
              <ShoppingBag className="h-4 w-4" /> Voir le panier
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
