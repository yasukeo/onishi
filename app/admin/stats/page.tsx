"use client";

import { useMemo, useState } from "react";
import { Loader2, TrendingUp, ShoppingBag, Ban, Trophy } from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { formatDh, cn } from "@/lib/utils";

type Fenetre = 7 | 30;

export default function StatsPage() {
  const { orders, loading } = useOrders();
  const [fenetre, setFenetre] = useState<Fenetre>(7);

  const data = useMemo(() => {
    const since = Date.now() - fenetre * 86400000;
    const win = orders.filter((o) => new Date(o.creee_le).getTime() >= since);
    const valides = win.filter((o) => o.statut !== "annulee");
    const annulees = win.filter((o) => o.statut === "annulee").length;
    const ca = valides.reduce((s, o) => s + o.total, 0);
    const panier = valides.length ? ca / valides.length : 0;
    const tauxAnnul = win.length ? Math.round((annulees / win.length) * 100) : 0;

    // CA par jour
    const parJour: { label: string; ca: number }[] = [];
    for (let i = fenetre - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toDateString();
      const total = valides.filter((o) => new Date(o.creee_le).toDateString() === key).reduce((s, o) => s + o.total, 0);
      parJour.push({ label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), ca: total });
    }

    // Commandes par heure
    const parHeure = Array.from({ length: 24 }, () => 0);
    valides.forEach((o) => { parHeure[new Date(o.creee_le).getHours()]++; });

    // Top plats
    const compte = new Map<string, { qte: number; ca: number }>();
    valides.forEach((o) => o.items.forEach((it) => {
      const cur = compte.get(it.nom) ?? { qte: 0, ca: 0 };
      cur.qte += it.quantite;
      cur.ca += it.prix_unitaire * it.quantite;
      compte.set(it.nom, cur);
    }));
    const top = [...compte.entries()].map(([nom, v]) => ({ nom, ...v })).sort((a, b) => b.qte - a.qte).slice(0, 8);

    return { valides, annulees, ca, panier, tauxAnnul, parJour, parHeure, top };
  }, [orders, fenetre]);

  const maxJour = Math.max(1, ...data.parJour.map((d) => d.ca));
  const maxHeure = Math.max(1, ...data.parHeure);
  const maxTop = Math.max(1, ...data.top.map((t) => t.qte));

  const cards = [
    { label: "Chiffre d'affaires", value: formatDh(data.ca), icon: TrendingUp },
    { label: "Commandes", value: String(data.valides.length), icon: ShoppingBag },
    { label: "Panier moyen", value: formatDh(data.panier), icon: TrendingUp },
    { label: "Taux d'annulation", value: `${data.tauxAnnul}%`, icon: Ban },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-up p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-ink">Statistiques</h1>
        <div className="flex gap-2">
          {([7, 30] as Fenetre[]).map((f) => (
            <button key={f} onClick={() => setFenetre(f)} className={cn(
              "h-10 rounded-full border px-4 text-sm font-medium",
              fenetre === f ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-sand-deep text-ink-soft hover:bg-sand"
            )}>{f} jours</button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-2xl font-semibold text-ink">{c.value}</p>
                <p className="text-xs text-ink-soft">{c.label}</p>
              </div>
            ))}
          </div>

          {/* CA par jour */}
          <section className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-5">
            <h2 className="mb-4 font-serif text-xl text-ink">Chiffre d&apos;affaires par jour</h2>
            <div className="flex h-44 items-end gap-1.5">
              {data.parJour.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-terracotta/80 transition-all hover:bg-terracotta"
                      style={{ height: `${(d.ca / maxJour) * 100}%` }}
                      title={formatDh(d.ca)}
                    />
                  </div>
                  <span className="text-[0.6rem] text-ink-soft">{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Commandes par heure */}
          <section className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-5">
            <h2 className="mb-4 font-serif text-xl text-ink">Affluence par heure</h2>
            <div className="flex h-32 items-end gap-0.5">
              {data.parHeure.map((n, h) => (
                <div key={h} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div className={cn("w-full rounded-t", n > 0 ? "bg-ember" : "bg-sand")} style={{ height: `${(n / maxHeure) * 100}%`, minHeight: n > 0 ? 4 : 0 }} title={`${h}h : ${n}`} />
                  </div>
                  {h % 3 === 0 && <span className="text-[0.55rem] text-ink-soft">{h}h</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Top plats */}
          <section className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink"><Trophy className="h-5 w-5 text-ember" /> Meilleures ventes</h2>
            {data.top.length === 0 ? (
              <p className="text-sm text-ink-soft">Pas encore de données sur la période.</p>
            ) : (
              <ul className="space-y-2.5">
                {data.top.map((t) => (
                  <li key={t.nom} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate text-sm text-ink">{t.nom}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded-full bg-sand">
                      <div className="h-full rounded-full bg-terracotta/80" style={{ width: `${(t.qte / maxTop) * 100}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink">{t.qte}</span>
                    <span className="hidden w-20 shrink-0 text-right text-xs text-ink-soft sm:inline">{formatDh(t.ca)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
