"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, EyeOff, Eye } from "lucide-react";
import { useMenu } from "@/lib/hooks/use-menu";
import { useAuth } from "@/lib/auth";
import { patchMenuItem, addMenuItem, removeMenuItem } from "@/lib/data/api";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { MenuItem } from "@/lib/types";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDh, cn } from "@/lib/utils";

export default function AdminMenuPage() {
  const { session } = useAuth();
  const { menu, loading, reload } = useMenu();
  const [editing, setEditing] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (session && session.role !== "admin") {
    return (
      <div className="p-8 text-center text-ink-soft">
        <p className="font-serif text-2xl text-ink">Accès réservé au gérant</p>
        <p className="mt-1 text-sm">La gestion du menu est limitée au rôle admin.</p>
      </div>
    );
  }

  async function toggle(item: MenuItem) {
    setBusy(true);
    await patchMenuItem(item.id, { disponible: !item.disponible });
    await reload();
    setBusy(false);
  }

  async function del(id: string) {
    if (!confirm("Supprimer ce plat ?")) return;
    setBusy(true);
    await removeMenuItem(id);
    await reload();
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Gestion du menu</h1>
        <p className="text-sm text-ink-soft">
          Ajoutez, modifiez ou désactivez un plat, son prix et sa disponibilité.
        </p>
        {!isSupabaseConfigured && (
          <p className="mt-2 inline-block rounded-lg bg-ember/15 px-3 py-1.5 text-xs text-terracotta-700">
            Mode démo : les modifications restent dans ce navigateur. Connectez Supabase pour les rendre publiques et persistantes.
          </p>
        )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-soft">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
        </div>
      ) : (
        <div className="space-y-8">
          {menu.map((cat) => (
            <section key={cat.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-serif text-xl text-ink">{cat.nom}</h2>
                <button
                  onClick={() => {
                    setAddingTo(addingTo === cat.id ? null : cat.id);
                    setEditing(null);
                  }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:underline"
                >
                  <Plus className="h-4 w-4" /> Ajouter
                </button>
              </div>

              {addingTo === cat.id && (
                <ItemForm
                  categoryId={cat.id}
                  onCancel={() => setAddingTo(null)}
                  onSave={async (data) => {
                    setBusy(true);
                    await addMenuItem({
                      category_id: cat.id,
                      nom: data.nom,
                      description: data.description,
                      prix: data.prix,
                      photo_url: null,
                      disponible: true,
                      options: [],
                      ordre_affichage: cat.items.length + 1,
                    });
                    await reload();
                    setBusy(false);
                    setAddingTo(null);
                  }}
                />
              )}

              <ul className="divide-y divide-sand-deep overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white">
                {cat.items.map((item) =>
                  editing === item.id ? (
                    <li key={item.id} className="p-3">
                      <ItemForm
                        initial={item}
                        categoryId={cat.id}
                        onCancel={() => setEditing(null)}
                        onSave={async (data) => {
                          setBusy(true);
                          await patchMenuItem(item.id, data);
                          await reload();
                          setBusy(false);
                          setEditing(null);
                        }}
                      />
                    </li>
                  ) : (
                    <li key={item.id} className="flex items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <p className={cn("font-medium", item.disponible ? "text-ink" : "text-ink-soft line-through")}>
                          {item.nom}
                        </p>
                        {item.description && (
                          <p className="truncate text-xs text-ink-soft">{item.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 font-semibold text-terracotta">{formatDh(item.prix)}</span>
                      <button
                        onClick={() => toggle(item)}
                        disabled={busy}
                        title={item.disponible ? "Disponible" : "Indisponible"}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-full",
                          item.disponible ? "bg-matcha/15 text-matcha" : "bg-sand text-ink-soft"
                        )}
                      >
                        {item.disponible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => { setEditing(item.id); setAddingTo(null); }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-sand"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => del(item.id)}
                        disabled={busy}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  )
                )}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: MenuItem;
  categoryId: string;
  onSave: (data: { nom: string; prix: number; description: string | null }) => void;
  onCancel: () => void;
}) {
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [prix, setPrix] = useState(initial?.prix?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);

  const valid = nom.trim().length > 0 && Number(prix) >= 0 && prix !== "";

  return (
    <div className="mb-3 rounded-[var(--radius-lg)] border border-terracotta/40 bg-terracotta/5 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <div>
          <Label>Nom</Label>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du plat" />
        </div>
        <div>
          <Label>Prix (dh)</Label>
          <Input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="decimal" placeholder="0" />
        </div>
      </div>
      <div className="mt-3">
        <Label>Description</Label>
        <Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} placeholder="Ingrédients…" />
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          disabled={!valid || saving}
          onClick={() => {
            setSaving(true);
            onSave({ nom: nom.trim(), prix: Number(prix), description: description?.trim() || null });
          }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Enregistrer
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" /> Annuler
        </Button>
      </div>
    </div>
  );
}
