"use client";

import { useMemo, useState } from "react";
import { Loader2, Search, User, Phone, Crown } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { formatDh, formatDateHeure, cn } from "@/lib/utils";

interface ClientAgg {
  telephone: string;
  nom: string;
  commandes: number;
  total: number;
  derniere: string;
}

export default function ClientsPage() {
  const { orders, loading } = useOrders();
  const [query, setQuery] = useState("");

  const clients = useMemo(() => {
    const map = new Map<string, ClientAgg>();
    for (const o of orders) {
      if (o.statut === "annulee") continue;
      const tel = o.client_telephone.trim();
      const cur = map.get(tel) ?? { telephone: tel, nom: o.client_nom, commandes: 0, total: 0, derniere: o.creee_le };
      cur.commandes += 1;
      cur.total += o.total;
      cur.nom = o.client_nom;
      if (new Date(o.creee_le) > new Date(cur.derniere)) cur.derniere = o.creee_le;
      map.set(tel, cur);
    }
    const list = [...map.values()].sort((a, b) => b.total - a.total);
    const q = query.trim().toLowerCase();
    return q ? list.filter((c) => c.nom.toLowerCase().includes(q) || c.telephone.includes(q)) : list;
  }, [orders, query]);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="font-serif text-3xl text-ink">Clients</h1>
        <p className="text-sm text-ink-soft">{clients.length} client(s) — par chiffre d&apos;affaires.</p>
      </header>

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom ou téléphone…"
          className="h-10 w-full rounded-full border border-sand-deep bg-white pl-9 pr-3 text-sm focus:border-terracotta focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>
      ) : clients.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-sand-deep py-12 text-center text-sm text-ink-soft">Aucun client.</p>
      ) : (
        <ul className="divide-y divide-sand-deep overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white">
          {clients.map((c, i) => (
            <li key={c.telephone} className="flex items-center gap-3 p-3">
              <span className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                i === 0 ? "bg-ember/20 text-ember" : "bg-terracotta/10 text-terracotta"
              )}>
                {i === 0 ? <Crown className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{c.nom}</p>
                <p className="flex items-center gap-1 text-xs text-ink-soft">
                  <Phone className="h-3 w-3" /> {c.telephone}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink">{formatDh(c.total)}</p>
                <p className="text-xs text-ink-soft">{c.commandes} cmd · {formatDateHeure(c.derniere)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
