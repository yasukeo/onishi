"use client";

import Link from "next/link";
import { Bike, Store, Clock, ChevronRight, Check, AlertTriangle, Tag } from "lucide-react";
import type { OrderAdmin } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { formatDh, depuis, cn } from "@/lib/utils";
import { nextStatus, slaLevel, STATUS_STYLE } from "./status";

export function OrderCard({
  order,
  onAdvance,
  isNew,
  now = Date.now(),
  selectable,
  selected,
  onSelect,
}: {
  order: OrderAdmin;
  onAdvance: (id: string, next: NonNullable<ReturnType<typeof nextStatus>>) => void;
  isNew?: boolean;
  now?: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const next = nextStatus(order.statut);
  const nbArticles = order.items.reduce((n, i) => n + i.quantite, 0);
  const ageMin = (now - new Date(order.maj_le).getTime()) / 60000;
  const sla = slaLevel(order.statut, ageMin);
  const accent = STATUS_STYLE[order.statut].dot;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white shadow-sm",
        "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
        isNew
          ? "border-terracotta ring-2 ring-terracotta/30"
          : sla === "late"
            ? "border-red-300 ring-1 ring-red-200"
            : sla === "warn"
              ? "border-ember/60"
              : "border-sand-deep/80"
      )}
    >
      {/* accent de statut à gauche */}
      <span className={cn("absolute inset-y-0 left-0 w-1", accent)} aria-hidden />

      <div className="p-3 pl-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {selectable && (
              <input
                type="checkbox"
                checked={!!selected}
                onChange={() => onSelect?.(order.id)}
                className="h-4 w-4 accent-[var(--color-terracotta)]"
                aria-label={`Sélectionner #${order.numero}`}
              />
            )}
            <Link
              href={`/admin/commandes/${order.id}`}
              className="text-[0.95rem] font-bold tabular-nums text-ink transition-colors hover:text-terracotta"
            >
              #{order.numero}
            </Link>
            {isNew && (
              <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-cream">
                Nouveau
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[0.7rem] font-medium text-ink-soft">
            {order.type === "livraison" ? <Bike className="h-3 w-3" /> : <Store className="h-3 w-3" />}
            {order.type === "livraison" ? order.quartier ?? "Livraison" : "Emporter"}
          </span>
        </div>

        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink">{order.client_nom}</p>
          <span className="shrink-0 text-sm font-bold text-terracotta">{formatDh(order.total)}</span>
        </div>
        <p className="text-xs text-ink-soft">
          {nbArticles} article{nbArticles > 1 ? "s" : ""}
          {order.code_promo && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-matcha/10 px-1 text-matcha">
              <Tag className="h-2.5 w-2.5" /> {order.code_promo}
            </span>
          )}
        </p>

        <ul className="mt-2 space-y-0.5 border-t border-sand pt-2 text-xs text-ink-soft">
          {order.items.slice(0, 3).map((it, i) => (
            <li key={i} className="flex gap-1.5 truncate">
              <span className="font-semibold text-ink/70">{it.quantite}×</span>
              <span className="truncate">{it.nom}</span>
            </li>
          ))}
          {order.items.length > 3 && (
            <li className="text-ink-soft/60">+{order.items.length - 3} de plus…</li>
          )}
        </ul>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[0.7rem] font-medium",
              sla === "late" ? "text-red-600" : sla === "warn" ? "text-[#9a6a1a]" : "text-ink-soft"
            )}
          >
            {sla === "ok" ? <Clock className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {depuis(order.maj_le)}
          </span>
          {next ? (
            <button
              onClick={() => onAdvance(order.id, next)}
              className="inline-flex items-center gap-1 rounded-full bg-terracotta px-3 py-1.5 text-xs font-semibold text-cream shadow-sm transition-all hover:bg-terracotta-600 active:scale-95"
            >
              {STATUS_LABEL[next]} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-matcha/10 px-2.5 py-1 text-xs font-semibold text-matcha">
              <Check className="h-3.5 w-3.5" /> Terminé
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
