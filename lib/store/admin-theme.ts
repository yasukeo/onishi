"use client";

import { create } from "zustand";

type Theme = "light" | "dark";
const KEY = "onishi:admin-theme";

interface AdminThemeState {
  theme: Theme;
  hydrate: () => void;
  toggle: () => void;
}

/** Thème de l'espace admin (clair par défaut, sombre pour la cuisine le soir). */
export const useAdminTheme = create<AdminThemeState>((set, get) => ({
  theme: "light",
  hydrate: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved) set({ theme: saved });
  },
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") localStorage.setItem(KEY, next);
    set({ theme: next });
  },
}));
