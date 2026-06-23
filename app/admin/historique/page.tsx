"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { bulkUpdateStatus } from "@/lib/data/api";
import { downloadCsv } from "@/lib/csv";
import { StatusBadge } from "@/components/admin/status";
import { STATUS_LABEL } from "@/lib/types";
import type { OrderStatus, OrderType } from "@/lib/types";
import { formatDh, formatDateHeure, cn } from "@/lib/utils";

const PAGE_SIZE = 20;
type Periode = "tous" | "jour" | "7j" | "30j";

function inPeriode(iso: string, p: Periode) {
  if (p === "tous") return true;
  const d = new Date(iso).getTime();
  const now = Date.now();
  const jours = p === "jour" ? 1 : p === "7j" ? 7 : 30;
  if (p === "jour") return new Date(iso).toDateString() === new Date().toDateString();
  return now - d <= jours * 86400000;
}

export default function HistoriquePage() {
  const { orders, loading, reload } = useOrders();
  const [query, setQuery] = useState("");
  const [statut, setStatut] = useState<OrderStatus | "tous">("tous");
  const [type, setType] = useState<OrderType | "tous">("tous");
  const [periode, setPeriode] = useState<Periode>("tous");
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statut !== "tous" && o.statut !== statut) return false;
      if (type !== "tous" && o.type !== type) return false;
      if (!inPeriode(o.creee_le, periode)) return false;
      if (!q) return true;
      return String(o.numero).includes(q) || o.client_nom.toLowerCase().includes(q) || o.client_telephone.includes(q);
    });
  }, [orders, query, statut, type, periode]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const ca = filtered.filter((o) => o.statut !== "annulee").reduce((s, o) => s + o.total, 0);

  function toggleSel(id: string) {
    setSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function exportCsv() {
    downloadCsv(
      `onishi-commandes-${new Date().toISOString().slice(0, 10)}.csv`,
      ["N°", "Date", "Client", "Téléphone", "Type", "Quartier", "Statut", "Sous-total", "Remise", "Livraison", "Total"],
      filtered.map((o) => [
        o.numero, formatDateHeure(o.creee_le), o.client_nom, o.client_telephone,
        o.type, o.quartier ?? "", STATUS_LABEL[o.statut], o.sous_total, o.remise, o.frais_livraison, o.total,
      ])
    );
  }

  async function bulk(s: OrderStatus) {
    await bulkUpdateStatus([...sel], s);
    setSel(new Set());
    reload();
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Historique des commandes</h1>
          <p className="text-sm text-ink-soft">{filtered.length} commande(s) · {formatDh(ca)}</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-sand-deep px-4 text-sm font-medium text-ink hover:bg-sand"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </header>

      {/* Filtres */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="N°, nom ou téléphone…"
            className="h-10 w-full rounded-full border border-sand-deep bg-white pl-9 pr-3 text-sm focus:border-terracotta focus:outline-none"
          />
        </div>
        <select value={statut} onChange={(e) => { setStatut(e.target.value as OrderStatus | "tous"); setPage(0); }} className="h-10 rounded-full border border-sand-deep bg-white px-3 text-sm">
          <option value="tous">Tous statuts</option>
          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value as OrderType | "tous"); setPage(0); }} className="h-10 rounded-full border border-sand-deep bg-white px-3 text-sm">
          <option value="tous">Tous types</option>
          <option value="livraison">Livraison</option>
          <option value="emporter">À emporter</option>
        </select>
        <select value={periode} onChange={(e) => { setPeriode(e.target.value as Periode); setPage(0); }} className="h-10 rounded-full border border-sand-deep bg-white px-3 text-sm">
          <option value="tous">Toute période</option>
          <option value="jour">Aujourd&apos;hui</option>
          <option value="7j">7 jours</option>
          <option value="30j">30 jours</option>
        </select>
      </div>

      {/* Actions groupées */}
      {sel.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-sm">
          <span className="font-medium text-ink">{sel.size} sélectionnée(s) →</span>
          {(["confirmee", "en_preparation", "en_livraison", "livree", "annulee"] as OrderStatus[]).map((s) => (
            <button key={s} onClick={() => bulk(s)} className="rounded-full border border-sand-deep bg-white px-2.5 py-1 text-xs font-medium hover:bg-sand">
              {STATUS_LABEL[s]}
            </button>
          ))}
          <button onClick={() => setSel(new Set())} className="ml-auto text-xs text-ink-soft hover:underline">Désélectionner</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>
      ) : filtered.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-sand-deep py-12 text-center text-sm text-ink-soft">Aucune commande.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-sand-deep bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-sand-deep text-left text-ink-soft">
                <tr>
                  <th className="w-10 p-3"></th>
                  <th className="p-3 font-medium">N°</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Statut</th>
                  <th className="p-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((o) => (
                  <tr key={o.id} className="border-b border-sand last:border-0 hover:bg-sand/40">
                    <td className="p-3">
                      <input type="checkbox" checked={sel.has(o.id)} onChange={() => toggleSel(o.id)} className="h-4 w-4 accent-[var(--color-terracotta)]" />
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/commandes/${o.id}`} className="font-semibold text-ink hover:text-terracotta">#{o.numero}</Link>
                    </td>
                    <td className="p-3 text-ink-soft">{formatDateHeure(o.creee_le)}</td>
                    <td className="p-3">
                      <span className="text-ink">{o.client_nom}</span>
                      <span className="block text-xs text-ink-soft">{o.client_telephone}</span>
                    </td>
                    <td className="p-3 text-ink-soft">{o.type === "livraison" ? "Livraison" : "Emporter"}</td>
                    <td className="p-3"><StatusBadge statut={o.statut} /></td>
                    <td className="p-3 text-right font-medium text-ink">{formatDh(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="inline-flex h-9 items-center gap-1 rounded-full border border-sand-deep px-3 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Préc.
              </button>
              <span className="text-ink-soft">Page {page + 1} / {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} className="inline-flex h-9 items-center gap-1 rounded-full border border-sand-deep px-3 disabled:opacity-40">
                Suiv. <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
