"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { listReviews } from "@/lib/data/api";
import { subscribeDemo } from "@/lib/data/demo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Stars } from "@/components/ui/stars";
import type { Review } from "@/lib/types";
import { formatDateHeure } from "@/lib/utils";

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => listReviews().then((r) => { setReviews(r); setLoading(false); });
    load();
    if (!isSupabaseConfigured) return subscribeDemo(load);
  }, []);

  const moyenne = reviews.length ? reviews.reduce((s, r) => s + r.note, 0) / reviews.length : 0;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-5">
        <h1 className="font-serif text-3xl text-ink">Avis clients</h1>
        {reviews.length > 0 && (
          <div className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
            <Stars value={Math.round(moyenne)} />
            <span>{moyenne.toFixed(1)} / 5 · {reviews.length} avis</span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center text-ink-soft">
          <MessageSquare className="h-10 w-10 text-ink-soft/40" />
          <p className="mt-3 font-serif text-xl text-ink">Aucun avis pour l&apos;instant</p>
          <p className="mt-1 text-sm">Les clients peuvent noter leur commande depuis la page de suivi, une fois livrée.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <Stars value={r.note} />
                <span className="text-xs text-ink-soft">{formatDateHeure(r.creee_le)}</span>
              </div>
              {r.commentaire && <p className="mt-2 text-sm text-ink">« {r.commentaire} »</p>}
              <p className="mt-2 text-xs text-ink-soft">
                {r.client_nom ?? "Client"}{r.numero ? ` · commande #${r.numero}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
