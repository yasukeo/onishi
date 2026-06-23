"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo";
import { useCart } from "@/lib/store/cart";
import { useCartUI } from "@/lib/store/cart-ui";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Carte" },
  { href: "/localisation", label: "Localisation" },
  { href: "/a-propos", label: "À propos" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.count());
  const openCart = useCartUI((s) => s.openCart);
  const mounted = useMounted();

  return (
    <header className="sticky top-0 z-50 border-b border-sand-deep/60 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <LogoLockup />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-terracotta/10 text-terracotta"
                    : "text-ink-soft hover:text-ink hover:bg-sand"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-terracotta px-4 text-sm font-medium text-cream transition-colors hover:bg-terracotta-600"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Panier</span>
            {mounted && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-semibold text-cream">
                {count}
              </span>
            )}
          </button>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-sand-deep/60 bg-cream md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium",
                  pathname === n.href
                    ? "text-terracotta"
                    : "text-ink-soft hover:bg-sand"
                )}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
