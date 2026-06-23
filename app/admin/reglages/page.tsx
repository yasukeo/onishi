"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save, Power, Check, Clock, Timer } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getLivraisonSettings, setLivraisonSettings,
  getHoraires, setHoraires,
  getServiceStatus, setServiceStatus,
  getEtaSettings, setEtaSettings,
} from "@/lib/data/api";
import { DEFAULT_LIVRAISON, DEFAULT_HORAIRES, DEFAULT_SERVICE, DEFAULT_ETA, DEFAULT_PLANNING } from "@/lib/data/settings-default";
import { computeServiceState } from "@/lib/horaires";
import type { LivraisonSettings, HorairesSettings, ServiceStatus, EtaSettings, DayHoraire } from "@/lib/types";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReglagesPage() {
  const { session } = useAuth();
  const [livraison, setLivr] = useState<LivraisonSettings>(DEFAULT_LIVRAISON);
  const [horaires, setHor] = useState<HorairesSettings>(DEFAULT_HORAIRES);
  const [service, setServ] = useState<ServiceStatus>(DEFAULT_SERVICE);
  const [eta, setEtaState] = useState<EtaSettings>(DEFAULT_ETA);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getLivraisonSettings(), getHoraires(), getServiceStatus(), getEtaSettings()]).then(([l, h, s, e]) => {
      setLivr(l);
      setHor({ ...h, planning: h.planning && h.planning.length === 7 ? h.planning : DEFAULT_PLANNING });
      setServ(s); setEtaState(e); setLoading(false);
    });
  }, []);

  const planning: DayHoraire[] = horaires.planning && horaires.planning.length === 7 ? horaires.planning : DEFAULT_PLANNING;
  const etat = computeServiceState(service, { ...horaires, planning });

  function patchDay(i: number, patch: Partial<DayHoraire>) {
    const next = planning.map((d, j) => (j === i ? { ...d, ...patch } : d));
    setHor({ ...horaires, planning: next });
  }

  if (session && session.role !== "admin") {
    return (
      <div className="p-8 text-center text-ink-soft">
        <p className="font-serif text-2xl text-ink">Accès réservé au gérant</p>
      </div>
    );
  }

  function flash(msg: string) {
    setSaved(msg);
    setTimeout(() => setSaved(null), 1800);
  }

  async function saveLivraison() {
    await setLivraisonSettings(livraison);
    flash("Zone de livraison enregistrée");
  }
  async function saveHoraires() {
    await setHoraires({ ...horaires, planning });
    flash("Horaires enregistrés");
  }
  async function saveEta() {
    await setEtaSettings(eta);
    flash("Délais estimés enregistrés");
  }
  async function toggleService() {
    const v = { ...service, ouvert: !service.ouvert };
    setServ(v);
    await setServiceStatus(v);
  }
  async function saveServiceMsg() {
    await setServiceStatus(service);
    flash("Message enregistré");
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-ink-soft"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Réglages</h1>
        <p className="text-sm text-ink-soft">Statut du service, horaires et zone de livraison.</p>
      </header>

      {saved && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-matcha/10 px-3 py-2 text-sm text-matcha">
          <Check className="h-4 w-4" /> {saved}
        </div>
      )}

      <div className="space-y-6">
        {/* Statut service */}
        <section className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-5">
          <h2 className="font-serif text-xl text-ink">Statut du service</h2>
          <p className="mb-3 text-sm text-ink-soft">
            En pause, la prise de commande est coupée sur le site public — quels que soient les
            horaires. Sinon, le site ouvre et ferme <strong>automatiquement</strong> selon le
            planning ci-dessous.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleService}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border px-5 font-medium",
                service.ouvert ? "border-matcha/50 bg-matcha/10 text-matcha" : "border-red-300 bg-red-50 text-red-700"
              )}
            >
              <Power className="h-4 w-4" /> {service.ouvert ? "Service actif (auto)" : "Service en pause"}
            </button>
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
              etat.open ? "bg-matcha/10 text-matcha" : "bg-red-50 text-red-700"
            )}>
              <Clock className="h-4 w-4" />
              {etat.open ? "Ouvert maintenant" : etat.message}
            </span>
          </div>
          <div className="mt-4">
            <Label>Message affiché quand le service est fermé</Label>
            <div className="flex gap-2">
              <Input
                value={service.message}
                onChange={(e) => setServ({ ...service, message: e.target.value })}
                placeholder="Ex. Fermé exceptionnellement, retour demain 12h"
              />
              <Button variant="outline" size="md" onClick={saveServiceMsg}><Save className="h-4 w-4" /></Button>
            </div>
          </div>
        </section>

        {/* Horaires */}
        <section className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-5">
          <h2 className="mb-1 font-serif text-xl text-ink">Horaires d&apos;ouverture</h2>
          <p className="mb-4 text-sm text-ink-soft">
            Le site ouvre/ferme automatiquement selon ce planning (heure de Casablanca).
            Une commande hors créneau est refusée côté serveur.
          </p>

          <div className="space-y-1.5">
            {planning.map((d, i) => (
              <div
                key={d.jour}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-[var(--radius)] border px-3 py-2",
                  d.ouvert ? "border-sand-deep bg-white" : "border-sand-deep/60 bg-sand/40"
                )}
              >
                <button
                  type="button"
                  onClick={() => patchDay(i, { ouvert: !d.ouvert })}
                  className={cn(
                    "inline-flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors",
                    d.ouvert ? "bg-matcha" : "bg-sand-deep"
                  )}
                  aria-label={`${d.jour} ${d.ouvert ? "ouvert" : "fermé"}`}
                  aria-pressed={d.ouvert}
                >
                  <span className={cn("h-6 w-6 rounded-full bg-white shadow transition-transform", d.ouvert && "translate-x-5")} />
                </button>
                <span className="w-24 shrink-0 font-medium text-ink">{d.jour}</span>
                {d.ouvert ? (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={d.ouvre}
                      onChange={(e) => patchDay(i, { ouvre: e.target.value })}
                      className="h-9 rounded-[var(--radius)] border border-sand-deep bg-white px-2 text-ink focus:border-terracotta focus:outline-none"
                    />
                    <span className="text-ink-soft">→</span>
                    <input
                      type="time"
                      value={d.ferme}
                      onChange={(e) => patchDay(i, { ferme: e.target.value })}
                      className="h-9 rounded-[var(--radius)] border border-sand-deep bg-white px-2 text-ink focus:border-terracotta focus:outline-none"
                    />
                    <span className="text-xs text-ink-soft">(00:00 = minuit)</span>
                  </div>
                ) : (
                  <span className="text-sm text-ink-soft">Fermé</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Label>Texte affiché sur le site (résumé lisible)</Label>
            <Input value={horaires.texte} onChange={(e) => setHor({ ...horaires, texte: e.target.value })} />
          </div>
          <Button className="mt-4" onClick={saveHoraires}><Save className="mr-1 h-4 w-4" /> Enregistrer les horaires</Button>
        </section>

        {/* Délais estimés (ETA) */}
        <section className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-5">
          <h2 className="mb-1 flex items-center gap-2 font-serif text-xl text-ink">
            <Timer className="h-5 w-5 text-terracotta" /> Délais estimés
          </h2>
          <p className="mb-4 text-sm text-ink-soft">
            Servent à afficher au client l&apos;heure d&apos;arrivée estimée sur sa page de suivi.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Préparation (min)</Label>
              <Input
                inputMode="numeric"
                value={String(eta.preparation_min)}
                onChange={(e) => setEtaState({ ...eta, preparation_min: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Livraison (min)</Label>
              <Input
                inputMode="numeric"
                value={String(eta.livraison_min)}
                onChange={(e) => setEtaState({ ...eta, livraison_min: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={saveEta}><Save className="mr-1 h-4 w-4" /> Enregistrer les délais</Button>
        </section>

        {/* Zone de livraison */}
        <section className="rounded-[var(--radius-lg)] border border-sand-deep bg-white p-5">
          <h2 className="mb-3 font-serif text-xl text-ink">Zone de livraison</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Frais par défaut (dh)</Label>
              <Input
                inputMode="decimal"
                value={String(livraison.frais_par_defaut)}
                onChange={(e) => setLivr({ ...livraison, frais_par_defaut: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Minimum de commande (dh)</Label>
              <Input
                inputMode="decimal"
                value={String(livraison.minimum_commande)}
                onChange={(e) => setLivr({ ...livraison, minimum_commande: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <h3 className="mb-2 mt-5 text-sm font-medium text-ink">Quartiers livrés</h3>
          <div className="space-y-2">
            {livraison.quartiers.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={q.nom}
                  onChange={(e) => {
                    const quartiers = [...livraison.quartiers];
                    quartiers[i] = { ...q, nom: e.target.value };
                    setLivr({ ...livraison, quartiers });
                  }}
                  placeholder="Nom du quartier"
                />
                <Input
                  className="w-28"
                  inputMode="decimal"
                  value={String(q.frais)}
                  onChange={(e) => {
                    const quartiers = [...livraison.quartiers];
                    quartiers[i] = { ...q, frais: Number(e.target.value) || 0 };
                    setLivr({ ...livraison, quartiers });
                  }}
                  placeholder="Frais"
                />
                <button
                  onClick={() => setLivr({ ...livraison, quartiers: livraison.quartiers.filter((_, j) => j !== i) })}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] text-ink-soft hover:bg-red-50 hover:text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setLivr({ ...livraison, quartiers: [...livraison.quartiers, { nom: "", frais: livraison.frais_par_defaut }] })}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:underline"
          >
            <Plus className="h-4 w-4" /> Ajouter un quartier
          </button>

          <div>
            <Button className="mt-4" onClick={saveLivraison}><Save className="mr-1 h-4 w-4" /> Enregistrer la zone</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
