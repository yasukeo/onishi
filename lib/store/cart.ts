"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, MenuItem } from "../types";

interface CartState {
  lines: CartLine[];
  add: (item: MenuItem, optionsChoisies?: Record<string, string>, qty?: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: () => number;
  sousTotal: () => number;
}

/** Clé de ligne = item + options choisies (deux configs distinctes = 2 lignes). */
function lineKey(itemId: string, options: Record<string, string>): string {
  const opt = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k]}`)
    .join("|");
  return opt ? `${itemId}__${opt}` : itemId;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      add: (item, optionsChoisies = {}, qty = 1) => {
        const key = lineKey(item.id, optionsChoisies);
        const lines = [...get().lines];
        const existing = lines.find((l) => l.key === key);
        if (existing) {
          existing.quantite += qty;
        } else {
          lines.push({
            key,
            itemId: item.id,
            nom: item.nom,
            prixUnitaire: item.prix,
            quantite: qty,
            optionsChoisies,
            photoUrl: item.photo_url,
          });
        }
        set({ lines });
      },

      increment: (key) =>
        set({
          lines: get().lines.map((l) =>
            l.key === key ? { ...l, quantite: l.quantite + 1 } : l
          ),
        }),

      decrement: (key) =>
        set({
          lines: get()
            .lines.map((l) =>
              l.key === key ? { ...l, quantite: l.quantite - 1 } : l
            )
            .filter((l) => l.quantite > 0),
        }),

      remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),

      clear: () => set({ lines: [] }),

      count: () => get().lines.reduce((n, l) => n + l.quantite, 0),

      sousTotal: () =>
        get().lines.reduce((sum, l) => sum + l.prixUnitaire * l.quantite, 0),
    }),
    { name: "onishi:cart" }
  )
);
