"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Bell, BellOff, Loader2, Search, Printer, Power, BellRing, Inbox,
} from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { useAuth } from "@/lib/auth";
import { updateOrderStatus, getServiceStatus, setServiceStatus } from "@/lib/data/api";
import { DEFAULT_SERVICE } from "@/lib/data/settings-default";
import { playChime } from "@/lib/sound";
import { ensureNotifyPermission, notify, notifyEnabled } from "@/lib/notify";
import { printHtml, ticketHtml } from "@/lib/print";
import { OrderCard } from "@/components/admin/order-card";
import { STATUS_STYLE } from "@/components/admin/status";
import { STATUS_LABEL } from "@/lib/types";
import type { OrderStatus, OrderType, ServiceStatus } from "@/lib/types";
import { formatDh, cn } from "@/lib/utils";

const COLUMNS: OrderStatus[] = ["nouvelle", "confirmee", "en_preparation", "en_livraison", "livree"];

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

/** Bouton de la barre d'outils (état actif harmonisé). */
function ToolButton({
  active, onClick, title, children,
}: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-all active:scale-95",
        active
          ? "border-terracotta bg-terracotta/10 text-terracotta"
          : "border-sand-deep bg-white/60 text-ink-soft hover:bg-white hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const { orders, loading, reload } = useOrders();
  const { session } = useAuth();
  const isAdmin = session?.role === "admin";

  const [soundOn, setSoundOn] = useState(true);
  const [notifOn, setNotifOn] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);
  const [service, setService] = useState<ServiceStatus>(DEFAULT_SERVICE);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrderType | "tous">("tous");
  const [now, setNow] = useState(() => Date.now());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownNouvelles = useRef<Set<string> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    getServiceStatus().then(setService);
    setNotifOn(notifyEnabled());
  }, []);

  useEffect(() => {
    const current = new Set(orders.filter((o) => o.statut === "nouvelle").map((o) => o.id));
    if (knownNouvelles.current === null) {
      knownNouvelles.current = current;
      return;
    }
    const fresh = [...current].filter((id) => !knownNouvelles.current!.has(id));
    if (fresh.length > 0) {
      if (soundOn) playChime();
      const freshOrders = orders.filter((o) => fresh.includes(o.id));
      if (notifOn && freshOrders[0]) {
        notify(`Nouvelle commande #${freshOrders[0].numero}`, `${freshOrders[0].client_nom} · ${formatDh(freshOrders[0].total)}`);
      }
      if (autoPrint) freshOrders.forEach((o) => printHtml(ticketHtml(o)));
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
  }, [orders, soundOn, notifOn, autoPrint]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (typeFilter !== "tous" && o.type !== typeFilter) return false;
      if (!q) return true;
      return String(o.numero).includes(q) || o.client_nom.toLowerCase().includes(q) || o.client_telephone.includes(q);
    });
  }, [orders, query, typeFilter]);

  const grouped = useMemo(() => {
    const g: Record<OrderStatus, typeof orders> = {
      nouvelle: [], confirmee: [], en_preparation: [], en_livraison: [], livree: [], annulee: [],
    };
    for (const o of filtered) g[o.statut].push(o);
    return g;
  }, [filtered]);

  const todays = orders.filter((o) => isToday(o.creee_le) && o.statut !== "annulee");
  const caJour = todays.reduce((s, o) => s + o.total, 0);
  const enCours = orders.filter((o) =>
    ["nouvelle", "confirmee", "en_preparation", "en_livraison"].includes(o.statut)
  ).length;

  async function advance(id: string, next: OrderStatus) {
    await updateOrderStatus(id, next);
    reload();
  }

  async function toggleService() {
    const v = { ...service, ouvert: !service.ouvert };
    setService(v);
    await setServiceStatus(v);
  }

  function toggleNotif() {
    if (!notifyEnabled()) {
      ensureNotifyPermission();
      setTimeout(() => setNotifOn(notifyEnabled()), 500);
    } else {
      setNotifOn((v) => !v);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh flex-col bg-gradient-to-b from-cream to-sand/40">
        {/* ── Barre supérieure ─────────────────────────────── */}
        <header className="border-b border-sand-deep/70 bg-cream/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl leading-none text-ink">Commandes</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-0.5 font-medium text-terracotta">
                  {enCours} en cours
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 font-medium text-ink-soft">
                  {todays.length} aujourd&apos;hui
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-matcha/10 px-2 py-0.5 font-medium text-matcha">
                  {formatDh(caJour)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <button
                  onClick={toggleService}
                  title="Ouvrir / fermer la prise de commande"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-all active:scale-95",
                    service.ouvert
                      ? "border-matcha/40 bg-matcha/10 text-matcha"
                      : "border-red-300 bg-red-50 text-red-700"
                  )}
                >
                  <Power className="h-4 w-4" />
                  <span className="hidden sm:inline">{service.ouvert ? "Service ouvert" : "Service fermé"}</span>
                </button>
              )}
              <ToolButton active={notifOn} onClick={toggleNotif} title="Notifications navigateur">
                <BellRing className="h-4 w-4" /> <span className="hidden sm:inline">Notif.</span>
              </ToolButton>
              <ToolButton active={soundOn} onClick={() => setSoundOn((v) => !v)} title={soundOn ? "Son activé" : "Son coupé"}>
                {soundOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />} <span className="hidden sm:inline">Son</span>
              </ToolButton>
              <ToolButton active={autoPrint} onClick={() => setAutoPrint((v) => !v)} title="Imprimer chaque nouvelle commande">
                <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Auto</span>
              </ToolButton>
            </div>
          </div>

          {/* Recherche + filtres */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher n°, nom ou téléphone…"
                className="h-9 w-full rounded-full border border-sand-deep bg-white pl-9 pr-3 text-sm transition-colors focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/15"
              />
            </div>
            <div className="flex items-center gap-1 rounded-full border border-sand-deep bg-white/60 p-0.5">
              {(["tous", "livraison", "emporter"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "h-8 rounded-full px-3 text-sm font-medium transition-all active:scale-95",
                    typeFilter === t ? "bg-terracotta text-cream shadow-sm" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {t === "tous" ? "Tous" : t === "livraison" ? "Livraison" : "À emporter"}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Kanban ───────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-ink-soft">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement des commandes…
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-ink-soft">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Inbox className="h-8 w-8 text-terracotta/70" />
            </div>
            <p className="mt-4 font-serif text-2xl text-ink">Aucune commande pour l&apos;instant</p>
            <p className="mt-1 text-sm">Les nouvelles commandes apparaîtront ici en temps réel.</p>
          </div>
        ) : (
          <div className="flex flex-1 gap-3.5 overflow-x-auto p-4 sm:px-6">
            {COLUMNS.map((col) => (
              <div
                key={col}
                className="flex w-[290px] shrink-0 flex-col rounded-2xl border border-sand-deep/60 bg-white/45"
              >
                <div className="flex items-center justify-between gap-2 border-b border-sand-deep/50 px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_STYLE[col].dot)} />
                    {STATUS_LABEL[col]}
                  </span>
                  <span className="min-w-6 rounded-full bg-sand px-2 py-0.5 text-center text-xs font-bold text-ink-soft">
                    {grouped[col].length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {grouped[col].map((o) => (
                      <motion.div
                        key={o.id}
                        layout
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 34 }}
                      >
                        <OrderCard order={o} onAdvance={advance} isNew={newIds.has(o.id)} now={now} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {grouped[col].length === 0 && (
                    <p className="rounded-xl border border-dashed border-sand-deep/70 py-8 text-center text-xs text-ink-soft/50">
                      Vide
                    </p>
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
