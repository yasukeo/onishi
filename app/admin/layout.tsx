"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { canAccess, homeFor } from "@/lib/permissions";
import { useAdminTheme } from "@/lib/store/admin-theme";
import { Sidebar } from "@/components/admin/sidebar";
import { cn } from "@/lib/utils";

function Guard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useAdminTheme((s) => s.theme);
  const hydrate = useAdminTheme((s) => s.hydrate);
  const isLogin = pathname === "/admin/login";
  const allowed = session ? canAccess(pathname, session.role) : false;

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (loading) return;
    if (!session && !isLogin) router.replace("/admin/login");
    else if (session && isLogin) router.replace(homeFor(session.role));
    // Accès à une route interdite pour ce rôle → renvoi vers sa page d'accueil.
    else if (session && !isLogin && !allowed) router.replace(homeFor(session.role));
  }, [loading, session, isLogin, allowed, router]);

  if (isLogin) return <>{children}</>;

  // Tant que la session charge OU que l'accès n'est pas autorisé (redirection
  // en cours), on n'affiche jamais le contenu protégé.
  if (loading || !session || !allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sand text-ink-soft">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-dvh bg-sand", theme === "dark" && "admin-dark")}>
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Guard>{children}</Guard>
    </AuthProvider>
  );
}
