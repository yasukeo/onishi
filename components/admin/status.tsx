import type { OrderStatus } from "@/lib/types";
import { STATUS_LABEL, STATUS_FLOW } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Couleurs sobres et contrastées : lecture en 2 secondes en cuisine. */
export const STATUS_STYLE: Record<OrderStatus, { dot: string; chip: string; col: string }> = {
  nouvelle: {
    dot: "bg-terracotta",
    chip: "bg-terracotta/12 text-terracotta-700",
    col: "border-terracotta/40",
  },
  confirmee: {
    dot: "bg-ember",
    chip: "bg-ember/15 text-[#9a6a1a]",
    col: "border-ember/40",
  },
  en_preparation: {
    dot: "bg-[#b9802a]",
    chip: "bg-[#b9802a]/15 text-[#8a5e1c]",
    col: "border-[#b9802a]/40",
  },
  en_livraison: {
    dot: "bg-[#4f7d8a]",
    chip: "bg-[#4f7d8a]/15 text-[#35606b]",
    col: "border-[#4f7d8a]/40",
  },
  livree: {
    dot: "bg-matcha",
    chip: "bg-matcha/15 text-[#566133]",
    col: "border-matcha/40",
  },
  annulee: {
    dot: "bg-[#9a8478]",
    chip: "bg-[#9a8478]/15 text-[#6b5a50]",
    col: "border-[#9a8478]/40",
  },
};

export function StatusBadge({ statut, className }: { statut: OrderStatus; className?: string }) {
  const s = STATUS_STYLE[statut];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        s.chip,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      {STATUS_LABEL[statut]}
    </span>
  );
}

/** Statut suivant dans le flux normal (null si terminé). */
export function nextStatus(statut: OrderStatus): OrderStatus | null {
  const i = STATUS_FLOW.indexOf(statut);
  if (i === -1 || i >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}
