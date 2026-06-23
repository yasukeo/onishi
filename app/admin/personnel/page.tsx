"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Crown, ChefHat, Bike } from "lucide-react";
import { useAuth, ROLE_LABEL } from "@/lib/auth";
import { listStaff, addStaff, updateStaff, removeStaff } from "@/lib/data/api";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { StaffRole, StaffUser } from "@/lib/types";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLE_ICON: Record<StaffRole, typeof Crown> = { admin: Crown, employe: ChefHat, livreur: Bike };

export default function PersonnelPage() {
  const { session } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [role, setRole] = useState<StaffRole>("livreur");
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setStaff(await listStaff());
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  if (session && session.role !== "admin") {
    return <div className="p-8 text-center text-ink-soft"><p className="font-serif text-2xl text-ink">Accès réservé au gérant</p></div>;
  }

  async function add() {
    if (!nom.trim()) return;
    const { error } = await addStaff(nom.trim(), role);
    if (error) { setError(error); return; }
    setError(null);
    setNom("");
    reload();
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Personnel</h1>
        <p className="text-sm text-ink-soft">Gérez les membres de l&apos;équipe et leurs rôles.</p>
      </header>

      {/* Ajout */}
      <div className="mb-6 rounded-[var(--radius-lg)] border border-sand-deep bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink">Ajouter un membre</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Label>Nom</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du membre" />
          </div>
          <div>
            <Label>Rôle</Label>
            <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className="h-11 rounded-[var(--radius)] border border-sand-deep bg-white px-3 text-sm">
              <option value="admin">Gérant</option>
              <option value="employe">Cuisine</option>
              <option value="livreur">Livreur</option>
            </select>
          </div>
          <Button onClick={add}><Plus className="mr-1 h-4 w-4" /> Ajouter</Button>
        </div>
        {error && <p className="mt-3 rounded-lg bg-ember/15 px-3 py-2 text-xs text-terracotta-700">{error}</p>}
        {isSupabaseConfigured && (
          <p className="mt-2 text-xs text-ink-soft">
            En production : créez d&apos;abord le compte dans Supabase (Authentication → Add user), puis <code>make_staff()</code>.
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>
      ) : (
        <ul className="divide-y divide-sand-deep overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white">
          {staff.map((u) => {
            const Icon = ROLE_ICON[u.role];
            return (
              <li key={u.id} className={cn("flex items-center gap-3 p-3", !u.actif && "opacity-50")}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{u.nom}</p>
                  <p className="text-xs text-ink-soft">{ROLE_LABEL[u.role]}{!u.actif && " · inactif"}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => updateStaff(u.id, { role: e.target.value as StaffRole }).then(reload)}
                  className="h-9 rounded-[var(--radius)] border border-sand-deep bg-white px-2 text-sm"
                >
                  <option value="admin">Gérant</option>
                  <option value="employe">Cuisine</option>
                  <option value="livreur">Livreur</option>
                </select>
                <button
                  onClick={() => updateStaff(u.id, { actif: !u.actif }).then(reload)}
                  className="rounded-full border border-sand-deep px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-sand"
                >
                  {u.actif ? "Désactiver" : "Réactiver"}
                </button>
                {!isSupabaseConfigured && (
                  <button
                    onClick={() => { if (confirm("Supprimer ce membre ?")) removeStaff(u.id).then(reload); }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
