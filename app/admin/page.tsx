"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, Loader2, RotateCcw } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { updateOrderStatus } from "@/lib/data/api";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resetDemo } from "@/lib/data/demo";
import { playChime } from "@/lib/sound";
import { OrderCard } from "@/components/admin/order-card";
import { STATUS_STYLE } from "@/components/admin/status";
import { STATUS_LABEL } from "@/lib/types";
import type { OrderStatus } from "@/lib/types";
import { formatDh, cn } from "@/lib/utils";

const COLUMNS: OrderStatus[] = [
  "nouvelle",
  "confirmee",
  "en_preparation",
  "en_livraison",
  "livree",
];

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function DashboardPage() {
  const { orders, loading, reload } = useOrders();
  const [soundOn, setSoundOn] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownNouvelles = useRef<Set<string> | null>(null);

  // Détection de nouvelles commandes → alerte sonore + visuelle.
  useEffect(() => {
    const current = new Set(orders.filter((o) => o.statut === "nouvelle").map((o) => o.id));
    if (knownNouvelles.current === null) {
      knownNouvelles.current = current;
      return;
    }
    const fresh = [...current].filter((id) => !knownNouvelles.current!.has(id));
    if (fresh.length > 0) {
      if (soundOn) playChime();
      setNewIds((prev) => new Set([...prev, ...fresh]));
      fresh.forEach((id) =>
        setTimeout(() => setNewIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        }), 6000)
      );
    }
    knownNouvelles.current = current;
  }, [orders, soundOn]);

  const grouped = useMemo(() => {
    const g: Record<OrderStatus, typeof orders> = {
      nouvelle: [], confirmee: [], en_preparation: [], en_livraison: [], livree: [], annulee: [],
    };
    for (const o of orders) g[o.statut].push(o);
    return g;
  }, [orders]);

  const todays = orders.filter((o) => isToday(o.creee_le) && o.statut !== "annulee");
  const caJour = todays.reduce((s, o) => s + o.total, 0);
  const enCours = orders.filter((o) =>
    ["nouvelle", "confirmee", "en_preparation", "en_livraison"].includes(o.statut)
  ).length;

  async function advance(id: string, next: OrderStatus) {
    await updateOrderStatus(id, next);
    reload();
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Barre supérieure */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sand-deep bg-cream px-4 py-3 sm:px-6">
        <div>
          <h1 className="font-serif text-2xl text-ink">Commandes</h1>
          <p className="text-xs text-ink-soft">
            {enCours} en cours · {todays.length} aujourd&apos;hui · {formatDh(caJour)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn((v) => !v)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium",
              soundOn ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-sand-deep text-ink-soft"
            )}
            title={soundOn ? "Son activé" : "Son coupé"}
          >
            {soundOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundOn ? "Son activé" : "Son coupé"}</span>
          </button>
          {!isSupabaseConfigured && (
            <button
              onClick={() => {
                if (confirm("Réinitialiser les données de démo (commandes + menu) ?")) {
                  resetDemo();
                  reload();
                }
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-sand-deep px-3.5 text-sm font-medium text-ink-soft hover:bg-sand"
              title="Réinitialiser la démo"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Réinit. démo</span>
            </button>
          )}
        </div>
      </header>

      {/* Kanban */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-ink-soft">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement des commandes…
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-ink-soft">
          <p className="font-serif text-2xl text-ink">Aucune commande pour l&apos;instant</p>
          <p className="mt-1 text-sm">
            {isSupabaseConfigured
              ? "Les nouvelles commandes apparaîtront ici en temps réel."
              : "Passez une commande depuis le site (mode démo) pour la voir arriver ici."}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 gap-4 overflow-x-auto p-4 sm:px-6">
          {COLUMNS.map((col) => (
            <div key={col} className="flex w-72 shrink-0 flex-col">
              <div className={cn("mb-3 flex items-center justify-between rounded-lg border-l-4 bg-white px-3 py-2", STATUS_STYLE[col].col)}>
                <span className="text-sm font-semibold text-ink">{STATUS_LABEL[col]}</span>
                <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-ink-soft">
                  {grouped[col].length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pb-4">
                {grouped[col].map((o) => (
                  <OrderCard key={o.id} order={o} onAdvance={advance} isNew={newIds.has(o.id)} />
                ))}
                {grouped[col].length === 0 && (
                  <p className="rounded-lg border border-dashed border-sand-deep py-6 text-center text-xs text-ink-soft/60">
                    Vide
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
