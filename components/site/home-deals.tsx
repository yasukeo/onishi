"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMenu } from "@/lib/hooks/use-menu";
import { DishImage } from "./dish-image";
import { MenuCardSkeleton } from "@/components/ui/skeleton";
import { formatDh } from "@/lib/utils";

/** « Onishi Deals » sur l'accueil — tirés du menu réel (Supabase). */
export function HomeDeals() {
  const { menu, loading } = useMenu();
  const deals = menu.find((c) => c.slug === "onishi-deals")?.items ?? [];
  const items = (deals.length ? deals : menu.flatMap((c) => c.items)).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-terracotta">
            Les incontournables
          </p>
          <h2 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">Onishi Deals</h2>
        </div>
        <Link
          href="/menu"
          className="hidden items-center gap-1 text-sm font-medium text-terracotta hover:gap-2 sm:inline-flex"
        >
          Toute la carte <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <MenuCardSkeleton key={i} />)
          : items.map((d, i) => (
              <Link
                key={d.id}
                href="/menu"
                className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white/70"
              >
                <div className="relative aspect-[16/10]">
                  <DishImage src={d.photo_url} alt={d.nom} seed={i + 2} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl text-ink">{d.nom}</h3>
                    <span className="font-semibold text-terracotta">{formatDh(d.prix)}</span>
                  </div>
                  {d.description && <p className="mt-1 text-sm text-ink-soft">{d.description}</p>}
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
