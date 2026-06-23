"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { listPromos, addPromo, updatePromo, removePromo } from "@/lib/data/api";
import type { PromoCode, PromoType } from "@/lib/types";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDh, cn } from "@/lib/utils";

export default function PromosPage() {
  const { session } = useAuth();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [type, setType] = useState<PromoType>("pourcentage");
  const [valeur, setValeur] = useState("");
  const [min, setMin] = useState("");

  async function reload() {
    setPromos(await listPromos());
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  if (session && session.role !== "admin") {
    return <div className="p-8 text-center text-ink-soft"><p className="font-serif text-2xl text-ink">Accès réservé au gérant</p></div>;
  }

  async function add() {
    if (!code.trim() || valeur === "") return;
    await addPromo({
      code: code.trim().toUpperCase(),
      type,
      valeur: Number(valeur),
      min_commande: Number(min) || 0,
      actif: true,
      expire_le: null,
    });
    setCode(""); setValeur(""); setMin("");
    reload();
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Codes promo</h1>
        <p className="text-sm text-ink-soft">Remises appliquées au panier lors du checkout.</p>
      </header>

      {/* Création */}
      <div className="mb-6 rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink">Nouveau code</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PROMO20" className="uppercase" />
          </div>
          <div>
            <Label>Type</Label>
            <select value={type} onChange={(e) => setType(e.target.value as PromoType)} className="h-11 w-full rounded-[var(--radius)] border border-sand-deep bg-white px-3 text-sm">
              <option value="pourcentage">Pourcentage (%)</option>
              <option value="montant">Montant (dh)</option>
            </select>
          </div>
          <div>
            <Label>Valeur</Label>
            <Input value={valeur} onChange={(e) => setValeur(e.target.value)} inputMode="decimal" placeholder={type === "pourcentage" ? "10" : "15"} />
          </div>
          <div>
            <Label>Min. commande (dh)</Label>
            <Input value={min} onChange={(e) => setMin(e.target.value)} inputMode="decimal" placeholder="0" />
          </div>
        </div>
        <Button className="mt-4" onClick={add}><Plus className="mr-1 h-4 w-4" /> Créer le code</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>
      ) : promos.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-sand-deep py-10 text-center text-sm text-ink-soft">Aucun code promo.</p>
      ) : (
        <ul className="divide-y divide-sand-deep overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white">
          {promos.map((p) => (
            <li key={p.id} className={cn("flex items-center gap-3 p-3", !p.actif && "opacity-50")}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                <Tag className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono font-semibold text-ink">{p.code}</p>
                <p className="text-xs text-ink-soft">
                  {p.type === "pourcentage" ? `-${p.valeur}%` : `-${formatDh(p.valeur)}`}
                  {p.min_commande > 0 && ` · min. ${formatDh(p.min_commande)}`}
                </p>
              </div>
              <button
                onClick={() => updatePromo(p.id, { actif: !p.actif }).then(reload)}
                className="rounded-full border border-sand-deep px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-sand"
              >
                {p.actif ? "Désactiver" : "Activer"}
              </button>
              <button
                onClick={() => { if (confirm("Supprimer ce code ?")) removePromo(p.id).then(reload); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
