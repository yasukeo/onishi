"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Loader2, MapPin, Phone, Navigation, Bike, Check, Package } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { updateOrderStatus } from "@/lib/data/api";
import { StatusBadge } from "@/components/admin/status";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { formatDh, depuis } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const ACTIVE: OrderStatus[] = ["confirmee", "en_preparation", "en_livraison"];

function itineraire(o: { adresse: string | null; quartier: string | null; latitude: number | null; longitude: number | null }) {
  // Position GPS exacte si le client l'a précisée, sinon recherche par adresse.
  if (o.latitude != null && o.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${o.latitude},${o.longitude}`;
  }
  const dest = encodeURIComponent([o.adresse, o.quartier, "Témara, Maroc"].filter(Boolean).join(", "));
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

export default function LivraisonsPage() {
  const { orders, loading, reload } = useOrders();

  const aLivrer = useMemo(
    () =>
      orders
        .filter((o) => o.type === "livraison" && ACTIVE.includes(o.statut))
        .sort((a, b) => new Date(a.creee_le).getTime() - new Date(b.creee_le).getTime()),
    [orders]
  );

  async function set(id: string, s: OrderStatus) {
    await updateOrderStatus(id, s);
    reload();
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-5">
        <h1 className="font-serif text-3xl text-ink">Livraisons</h1>
        <p className="text-sm text-ink-soft">{aLivrer.length} commande(s) à livrer.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>
      ) : aLivrer.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center text-ink-soft">
          <Package className="h-10 w-10 text-ink-soft/40" />
          <p className="mt-3 font-serif text-xl text-ink">Aucune livraison en attente</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {aLivrer.map((o) => (
            <li key={o.id} className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/commandes/${o.id}`} className="font-semibold text-ink hover:text-terracotta">#{o.numero}</Link>
                  <span className="ml-2 text-sm text-ink-soft">{depuis(o.creee_le)}</span>
                </div>
                <StatusBadge statut={o.statut} />
              </div>

              <p className="mt-2 flex items-center gap-1.5 font-medium text-ink">
                <Bike className="h-4 w-4 text-terracotta" /> {o.client_nom} · {formatDh(o.total)}
              </p>
              <p className="flex items-start gap-1.5 text-sm text-ink-soft">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                {o.quartier ? `${o.quartier} — ` : ""}{o.adresse ?? "Adresse non précisée"}
                {o.latitude != null && o.longitude != null && (
                  <span className="ml-1 shrink-0 rounded-full bg-matcha/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-[#566133]">GPS</span>
                )}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={itineraire(o)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-sand-deep px-4 text-sm font-medium text-ink hover:bg-sand"
                >
                  <Navigation className="h-4 w-4" /> Itinéraire
                </a>
                <a
                  href={`tel:${o.client_telephone}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-sand-deep px-4 text-sm font-medium text-ink hover:bg-sand"
                >
                  <Phone className="h-4 w-4" /> Appeler
                </a>
                <WhatsappButton order={o} compact />
                {o.statut !== "en_livraison" ? (
                  <button onClick={() => set(o.id, "en_livraison")} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-charcoal px-4 text-sm font-medium text-cream hover:opacity-90">
                    <Bike className="h-4 w-4" /> En route
                  </button>
                ) : (
                  <button onClick={() => set(o.id, "livree")} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-matcha px-4 text-sm font-medium text-cream hover:opacity-90">
                    <Check className="h-4 w-4" /> Livré
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
