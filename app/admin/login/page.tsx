"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LogoMark } from "@/components/brand/logo";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { signInPassword } = useAuth();
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

  return (
    <div className="flex min-h-dvh items-center justify-center wave-bg bg-charcoal px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-white/10 bg-cream p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <LogoMark size={56} />
          <h1 className="mt-4 font-serif text-2xl text-ink">Espace équipe</h1>
          <p className="mt-1 text-sm text-ink-soft">Réception et suivi des commandes</p>
        </div>

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
      </div>
    </div>
  );
}
