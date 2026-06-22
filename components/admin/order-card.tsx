"use client";

import Link from "next/link";
import { Bike, Store, Clock, ChevronRight, Check } from "lucide-react";
import type { OrderAdmin } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { formatDh, depuis, cn } from "@/lib/utils";
import { nextStatus } from "./status";

export function OrderCard({
  order,
  onAdvance,
  isNew,
}: {
  order: OrderAdmin;
  onAdvance: (id: string, next: NonNullable<ReturnType<typeof nextStatus>>) => void;
  isNew?: boolean;
}) {
  const next = nextStatus(order.statut);
  const nbArticles = order.items.reduce((n, i) => n + i.quantite, 0);

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border bg-white p-3 shadow-sm transition-all",
        isNew ? "border-terracotta ring-2 ring-terracotta/30 animate-fade-up" : "border-sand-deep"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Link href={`/admin/commandes/${order.id}`} className="font-semibold text-ink hover:text-terracotta">
          #{order.numero}
        </Link>
        <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
          {order.type === "livraison" ? <Bike className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
          {order.type === "livraison" ? order.quartier ?? "Livraison" : "À emporter"}
        </span>
      </div>

      <p className="mt-1 truncate text-sm font-medium text-ink">{order.client_nom}</p>
      <p className="text-xs text-ink-soft">
        {nbArticles} article{nbArticles > 1 ? "s" : ""} · {formatDh(order.total)}
      </p>

      <ul className="mt-2 space-y-0.5 text-xs text-ink-soft">
        {order.items.slice(0, 3).map((it, i) => (
          <li key={i} className="truncate">
            {it.quantite}× {it.nom}
          </li>
        ))}
        {order.items.length > 3 && <li className="text-ink-soft/60">+{order.items.length - 3} de plus…</li>}
      </ul>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-sand pt-2">
        <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
          <Clock className="h-3 w-3" /> {depuis(order.creee_le)}
        </span>
        {next ? (
          <button
            onClick={() => onAdvance(order.id, next)}
            className="inline-flex items-center gap-1 rounded-full bg-terracotta px-2.5 py-1 text-xs font-medium text-cream hover:bg-terracotta-600"
          >
            {STATUS_LABEL[next]} <ChevronRight className="h-3 w-3" />
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-matcha">
            <Check className="h-3.5 w-3.5" /> Terminé
          </span>
        )}
      </div>
    </div>
  );
}
