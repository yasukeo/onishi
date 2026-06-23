"use client";

import { create } from "zustand";

interface CartUIState {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

/** État d'ouverture du tiroir panier (séparé du contenu du panier). */
export const useCartUI = create<CartUIState>((set, get) => ({
  open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
  toggleCart: () => set({ open: !get().open }),
}));
