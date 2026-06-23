"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Loader2, Bike, Store, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { updateOrderStatus } from "@/lib/data/api";
import { nextStatus, slaLevel } from "@/components/admin/status";
import { STATUS_LABEL } from "@/lib/types";
import type { OrderStatus } from "@/lib/types";
import { depuis, cn } from "@/lib/utils";

const COLS: OrderStatus[] = ["nouvelle", "confirmee", "en_preparation"];

export default function CuisinePage() {
  const { orders, loading, reload } = useOrders();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, typeof orders> = { nouvelle: [], confirmee: [], en_preparation: [] };
    orders.filter((o) => COLS.includes(o.statut)).forEach((o) => g[o.statut].push(o));
    return g;
  }, [orders]);

  async function advance(id: string, next: OrderStatus) {
    await updateOrderStatus(id, next);
    reload();
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex h-dvh flex-col bg-charcoal text-cream">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <h1 className="font-serif text-2xl">Cuisine — affichage commandes</h1>
        <span className="text-sm text-cream/60">
          {orders.filter((o) => COLS.includes(o.statut)).length} en cours
        </span>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-cream/60">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-3">
          {COLS.map((col) => (
            <div key={col} className="flex flex-col">
              <h2 className="mb-3 text-center text-lg font-semibold uppercase tracking-wide text-cream/80">
                {STATUS_LABEL[col]} <span className="text-cream/40">({grouped[col].length})</span>
              </h2>
              <div className="flex flex-col gap-3 overflow-y-auto">
                <AnimatePresence initial={false}>
                {grouped[col].map((o) => {
                  const next = nextStatus(o.statut);
                  const sla = slaLevel(o.statut, (now - new Date(o.maj_le).getTime()) / 60000);
                  return (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 500, damping: 34 }}
                      className={cn(
                        "rounded-xl bg-white p-4 text-ink shadow-lg",
                        sla === "warn" && "ring-2 ring-ember",
                        sla === "late" && "ring-4 ring-red-500"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">#{o.numero}</span>
                        <span className="inline-flex items-center gap-1 text-sm text-ink-soft">
                          {o.type === "livraison" ? <Bike className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                          {o.type === "livraison" ? "Livraison" : "Emporter"}
                        </span>
                      </div>
                      <span className={cn(
                        "mt-0.5 inline-flex items-center gap-1 text-sm font-medium",
                        sla === "late" ? "text-red-600" : sla === "warn" ? "text-[#9a6a1a]" : "text-ink-soft"
                      )}>
                        {sla === "ok" ? <Clock className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                        {depuis(o.maj_le)}
                      </span>
                      <ul className="mt-3 space-y-1.5 border-t border-sand pt-3">
                        {o.items.map((it, i) => (
                          <li key={i} className="flex gap-2 text-lg leading-tight">
                            <span className="font-bold text-terracotta">{it.quantite}×</span>
                            <span>
                              {it.nom}
                              {Object.keys(it.options_choisies).length > 0 && (
                                <span className="block text-sm text-ink-soft">{Object.values(it.options_choisies).join(", ")}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {o.notes && <p className="mt-2 rounded-lg bg-ember/15 px-2 py-1.5 text-sm text-ink">⚠ {o.notes}</p>}
                      {next && (
                        <button
                          onClick={() => advance(o.id, next)}
                          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-terracotta text-base font-semibold text-cream transition-transform hover:bg-terracotta-600 active:scale-95"
                        >
                          {STATUS_LABEL[next]} <ChevronRight className="h-5 w-5" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
                </AnimatePresence>
                {grouped[col].length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/15 py-10 text-center text-sm text-cream/40">Vide</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </MotionConfig>
  );
}
