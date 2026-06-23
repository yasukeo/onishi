"use client";

import { useMemo } from "react";
import { useMenu } from "@/lib/hooks/use-menu";
import { MenuItemCard } from "./menu-item-card";
import { MenuCardSkeleton } from "@/components/ui/skeleton";
import { FEATURED_NAMES } from "@/lib/menu-data";
import type { MenuItem } from "@/lib/types";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/**
 * Sélection « du chef » sur l'accueil — tirée du menu RÉEL (Supabase) pour que
 * les ajouts au panier portent les vrais identifiants des plats.
 */
export function FeaturedDishes() {
  const { menu, loading } = useMenu();

  const featured = useMemo<MenuItem[]>(() => {
    const all = menu.flatMap((c) => c.items).filter((i) => i.disponible);
    const picked: MenuItem[] = [];
    for (const name of FEATURED_NAMES) {
      const m = all.find((i) => norm(i.nom) === norm(name) && !picked.includes(i));
      if (m) picked.push(m);
    }
    for (const i of all) {
      if (picked.length >= 3) break;
      if (!picked.includes(i)) picked.push(i);
    }
    return picked.slice(0, 3);
  }, [menu]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-serif text-3xl text-ink sm:text-4xl">La sélection du chef</h2>
      <p className="mt-1 max-w-lg text-ink-soft">
        Un aperçu de nos créations. Ajoutez-les directement à votre panier.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <MenuCardSkeleton key={i} />)
          : featured.map((item, i) => <MenuItemCard key={item.id} item={item} seed={i} />)}
      </div>
    </section>
  );
}
