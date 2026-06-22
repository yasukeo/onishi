"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { useCart } from "@/lib/store/cart";
import { DishImage } from "./dish-image";
import { formatDh, cn } from "@/lib/utils";

export function MenuItemCard({ item, seed = 0 }: { item: MenuItem; seed?: number }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const [opts, setOpts] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.options.map((o) => [o.nom, o.choix[0]]))
  );

  const indisponible = !item.disponible;

  function handleAdd() {
    if (indisponible) return;
    add(item, opts);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white/70 transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <DishImage
          src={item.photo_url}
          alt={item.nom}
          seed={seed}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {indisponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink">
              Indisponible
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight text-ink">{item.nom}</h3>
          <span className="shrink-0 font-semibold text-terracotta">{formatDh(item.prix)}</span>
        </div>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
        )}

        {item.options.length > 0 && (
          <div className="mt-3 space-y-2">
            {item.options.map((opt) => (
              <div key={opt.nom}>
                <span className="mb-1 block text-xs font-medium text-ink-soft">{opt.nom}</span>
                <div className="flex flex-wrap gap-1.5">
                  {opt.choix.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setOpts((o) => ({ ...o, [opt.nom]: c }))}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors",
                        opts[opt.nom] === c
                          ? "border-terracotta bg-terracotta/10 text-terracotta"
                          : "border-sand-deep text-ink-soft hover:border-terracotta/50"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <button
            onClick={handleAdd}
            disabled={indisponible}
            className={cn(
              "inline-flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius)] text-sm font-medium transition-colors",
              indisponible
                ? "cursor-not-allowed bg-sand text-ink-soft/60"
                : added
                  ? "bg-matcha text-white"
                  : "bg-terracotta text-cream hover:bg-terracotta-600"
            )}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Ajouté
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
