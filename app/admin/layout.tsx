"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";

function Guard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !session && !isLogin) router.replace("/admin/login");
    if (!loading && session && isLogin) router.replace("/admin");
  }, [loading, session, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (loading || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sand text-ink-soft">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-sand">
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
