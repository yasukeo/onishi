"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseBrowser } from "./supabase/client";
import type { StaffRole } from "./types";

interface StaffSession {
  nom: string;
  role: StaffRole;
  email?: string;
}

interface AuthContextValue {
  session: StaffSession | null;
  loading: boolean;
  signInPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_LABEL: Record<StaffRole, string> = {
  admin: "Gérant",
  employe: "Cuisine",
  livreur: "Livreur",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabaseBrowser();

    async function loadStaff(userId: string, email?: string) {
      const { data } = await sb
        .from("staff_users")
        .select("nom, role")
        .eq("id", userId)
        .single();
      if (data) setSession({ nom: data.nom, role: data.role as StaffRole, email });
      else setSession(null);
      setLoading(false);
    }

    sb.auth.getSession().then(({ data }) => {
      if (data.session?.user) loadStaff(data.session.user.id, data.session.user.email ?? undefined);
      else {
        setSession(null);
        setLoading(false);
      }
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      if (s?.user) loadStaff(s.user.id, s.user.email ?? undefined);
      else setSession(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInPassword(email: string, password: string) {
    const sb = getSupabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: "Identifiants invalides." };
    return { error: null };
  }

  async function signOut() {
    const sb = getSupabaseBrowser();
    await sb.auth.signOut();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, loading, signInPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

export { ROLE_LABEL };
