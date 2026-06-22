"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseBrowser } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";
import type { StaffRole } from "./types";

interface StaffSession {
  nom: string;
  role: StaffRole;
  email?: string;
}

interface AuthContextValue {
  session: StaffSession | null;
  loading: boolean;
  isDemo: boolean;
  signInDemo: (role: StaffRole) => void;
  signInPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const DEMO_KEY = "onishi:demo:staff";
const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_LABEL: Record<StaffRole, string> = {
  admin: "Gérant",
  employe: "Cuisine",
  livreur: "Livreur",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured;

  useEffect(() => {
    if (isDemo) {
      try {
        const raw = localStorage.getItem(DEMO_KEY);
        setSession(raw ? (JSON.parse(raw) as StaffSession) : null);
      } catch {
        setSession(null);
      }
      setLoading(false);
      return;
    }

    const sb = getSupabaseBrowser();
    if (!sb) {
      setLoading(false);
      return;
    }

    async function loadStaff(userId: string, email?: string) {
      const { data } = await sb!
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
  }, [isDemo]);

  function signInDemo(role: StaffRole) {
    const s: StaffSession = { nom: ROLE_LABEL[role], role };
    localStorage.setItem(DEMO_KEY, JSON.stringify(s));
    setSession(s);
  }

  async function signInPassword(email: string, password: string) {
    const sb = getSupabaseBrowser();
    if (!sb) return { error: "Supabase non configuré." };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: "Identifiants invalides." };
    return { error: null };
  }

  async function signOut() {
    if (isDemo) {
      localStorage.removeItem(DEMO_KEY);
      setSession(null);
      return;
    }
    const sb = getSupabaseBrowser();
    await sb?.auth.signOut();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, isDemo, signInDemo, signInPassword, signOut }}
    >
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
