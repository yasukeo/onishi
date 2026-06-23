"use client";

import { MessageCircle } from "lucide-react";
import { whatsappLink, whatsappMessage } from "@/lib/whatsapp";
import type { OrderAdmin } from "@/lib/types";
import { cn } from "@/lib/utils";

type OrderLike = Pick<OrderAdmin, "numero" | "client_nom" | "client_telephone" | "statut" | "type" | "token">;

/**
 * Ouvre WhatsApp avec un message pré-rempli (n°, statut, lien de suivi).
 * Affiche rien si le numéro du client est inexploitable.
 */
export function WhatsappButton({
  order,
  compact = false,
  className,
  label,
}: {
  order: OrderLike;
  compact?: boolean;
  className?: string;
  label?: string;
}) {
  const link = whatsappLink(order.client_telephone, whatsappMessage(order));
  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 font-medium text-[#1a7f4b] transition-colors hover:bg-[#25D366]/20",
        compact ? "h-10 px-4 text-sm" : "h-11 px-5 text-sm",
        className
      )}
      title="Ouvrir WhatsApp avec un message pré-rempli"
    >
      <MessageCircle className="h-4 w-4" />
      {label ?? (compact ? "WhatsApp" : "Prévenir le client (WhatsApp)")}
    </a>
  );
}
