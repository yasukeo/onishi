"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, ChefHat, Bike, History, CalendarDays, BarChart3, Users, Star,
  UtensilsCrossed, Tag, UserCog, Settings, LogOut, ExternalLink, Moon, Sun,
} from "lucide-react";
import { useAuth, ROLE_LABEL } from "@/lib/auth";
import { useAdminTheme } from "@/lib/store/admin-theme";
import { LogoMark } from "@/components/brand/logo";
import type { StaffRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof LayoutGrid; roles: StaffRole[] };
type NavGroup = { titre: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    titre: "Opérations",
    items: [
      { href: "/admin", label: "Commandes", icon: LayoutGrid, roles: ["admin", "employe"] },
      { href: "/admin/cuisine", label: "Cuisine", icon: ChefHat, roles: ["admin", "employe"] },
      { href: "/admin/livraisons", label: "Livraisons", icon: Bike, roles: ["admin", "livreur"] },
    ],
  },
  {
    titre: "Suivi",
    items: [
      { href: "/admin/historique", label: "Historique", icon: History, roles: ["admin", "employe"] },
      { href: "/admin/jour", label: "Vue du jour", icon: CalendarDays, roles: ["admin", "employe"] },
      { href: "/admin/stats", label: "Statistiques", icon: BarChart3, roles: ["admin"] },
      { href: "/admin/clients", label: "Clients", icon: Users, roles: ["admin"] },
      { href: "/admin/avis", label: "Avis", icon: Star, roles: ["admin", "employe"] },
    ],
  },
  {
    titre: "Configuration",
    items: [
      { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed, roles: ["admin"] },
      { href: "/admin/promos", label: "Codes promo", icon: Tag, roles: ["admin"] },
      { href: "/admin/personnel", label: "Personnel", icon: UserCog, roles: ["admin"] },
      { href: "/admin/reglages", label: "Réglages", icon: Settings, roles: ["admin"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();
  const theme = useAdminTheme((s) => s.theme);
  const toggleTheme = useAdminTheme((s) => s.toggle);
  if (!session) return null;
  const role = session.role;

  return (
    <aside className="flex shrink-0 flex-col border-r border-white/10 bg-charcoal text-cream md:w-60">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        <LogoMark size={34} />
        <div className="hidden leading-tight md:block">
          <p className="font-serif text-base tracking-wider">ONISHI</p>
          <p className="text-[0.6rem] tracking-[0.2em] text-cream/50">ESPACE ÉQUIPE</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-2">
        {GROUPS.map((group) => {
          const items = group.items.filter((n) => n.roles.includes(role));
          if (items.length === 0) return null;
          return (
            <div key={group.titre}>
              <p className="mb-1 hidden px-3 text-[0.6rem] font-semibold uppercase tracking-wider text-cream/40 md:block">
                {group.titre}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((n) => {
                  const active = pathname === n.href;
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                        active
                          ? "bg-terracotta text-cream shadow-sm shadow-terracotta/30"
                          : "text-cream/65 hover:translate-x-0.5 hover:bg-white/10 hover:text-cream"
                      )}
                      title={n.label}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cream/90" />
                      )}
                      <n.icon className={cn("h-5 w-5 shrink-0 transition-transform", !active && "group-hover:scale-110")} />
                      <span className="hidden md:inline">{n.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/60 hover:bg-white/10 hover:text-cream"
          title={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
          <span className="hidden md:inline">{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
        </button>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/60 hover:bg-white/10 hover:text-cream"
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          <span className="hidden md:inline">Voir le site</span>
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2 rounded-lg px-3 py-2">
          <div className="hidden min-w-0 leading-tight md:block">
            <p className="truncate text-sm font-medium">{session.nom}</p>
            <p className="text-xs text-cream/50">{ROLE_LABEL[role]}</p>
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
