"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ChefHat, Bike, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LogoMark } from "@/components/brand/logo";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { StaffRole } from "@/lib/types";

const DEMO_ROLES: { role: StaffRole; label: string; desc: string; icon: typeof Crown }[] = [
  { role: "admin", label: "Gérant", desc: "Accès complet + menu", icon: Crown },
  { role: "employe", label: "Cuisine", desc: "Traitement des commandes", icon: ChefHat },
  { role: "livreur", label: "Livreur", desc: "Commandes à livrer", icon: Bike },
];

export default function LoginPage() {
  const { isDemo, signInDemo, signInPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signInPassword(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.replace("/admin");
    }
  }

  function handleDemo(role: StaffRole) {
    signInDemo(role);
    router.replace("/admin");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center wave-bg bg-charcoal px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-white/10 bg-cream p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <LogoMark size={56} />
          <h1 className="mt-4 font-serif text-2xl text-ink">Espace équipe</h1>
          <p className="mt-1 text-sm text-ink-soft">Réception et suivi des commandes</p>
        </div>

        {isDemo ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-ember/15 px-3 py-2 text-xs text-terracotta-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Mode démo : choisissez un rôle pour explorer l&apos;interface.
            </div>
            <div className="space-y-2.5">
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleDemo(r.role)}
                  className="flex w-full items-center gap-3 rounded-[var(--radius)] border border-sand-deep bg-white p-3.5 text-left transition-colors hover:border-terracotta hover:bg-terracotta/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-ink">{r.label}</span>
                    <span className="block text-xs text-ink-soft">{r.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handlePassword} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@onishi.ma"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
