"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarDays, UtensilsCrossed, LogOut, ExternalLink } from "lucide-react";
import { useAuth, ROLE_LABEL } from "@/lib/auth";
import { LogoMark } from "@/components/brand/logo";
import type { StaffRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: typeof LayoutGrid; roles: StaffRole[] }[] = [
  { href: "/admin", label: "Commandes", icon: LayoutGrid, roles: ["admin", "employe", "livreur"] },
  { href: "/admin/jour", label: "Vue du jour", icon: CalendarDays, roles: ["admin", "employe"] },
  { href: "/admin/menu", label: "Gestion du menu", icon: UtensilsCrossed, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();
  if (!session) return null;

  const items = NAV.filter((n) => n.roles.includes(session.role));

  return (
    <aside className="flex shrink-0 flex-col border-r border-white/10 bg-charcoal text-cream md:w-60">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        <LogoMark size={34} />
        <div className="hidden leading-tight md:block">
          <p className="font-serif text-base tracking-wider">ONISHI</p>
          <p className="text-[0.6rem] tracking-[0.2em] text-cream/50">ESPACE ÉQUIPE</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {items.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-terracotta text-cream" : "text-cream/70 hover:bg-white/10 hover:text-cream"
              )}
            >
              <n.icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream/60 hover:bg-white/10 hover:text-cream"
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          <span className="hidden md:inline">Voir le site</span>
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2 rounded-lg px-3 py-2">
          <div className="hidden min-w-0 leading-tight md:block">
            <p className="truncate text-sm font-medium">{session.nom}</p>
            <p className="text-xs text-cream/50">{ROLE_LABEL[session.role]}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-cream/60 hover:bg-white/10 hover:text-cream"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
