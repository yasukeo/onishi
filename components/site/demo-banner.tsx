"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoBanner() {
  const [hidden, setHidden] = useState(false);
  if (isSupabaseConfigured || hidden) return null;

  return (
    <div className="bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs sm:px-6">
        <Info className="h-3.5 w-3.5 shrink-0 text-ember" />
        <p className="flex-1">
          <span className="font-semibold">Maquette — mode démo.</span>{" "}
          Les commandes sont simulées dans votre navigateur (aucun paiement).
          Connectez Supabase pour activer le vrai backend.
        </p>
        <button
          onClick={() => setHidden(true)}
          aria-label="Masquer"
          className="rounded p-1 hover:bg-cream/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
