import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark Onishi. On utilise le vrai logo (public/logo.webp) tel quel —
 * jamais régénéré (brief 8). Pour les fonds clairs, on affiche une version
 * texte reprenant l'esprit du wordmark quand le logo carré ne convient pas.
 */
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.webp"
      alt="Onishi — Authentic Sushi"
      width={size}
      height={size}
      className={cn("rounded-[var(--radius-sm)] object-cover", className)}
      priority
    />
  );
}

export function LogoLockup({
  href = "/",
  light = false,
  className,
}: {
  href?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-3", className)}
      aria-label="Onishi — accueil"
    >
      <LogoMark size={42} className="shadow-sm transition-transform group-hover:scale-[1.03]" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-xl tracking-[0.18em]",
            light ? "text-cream" : "text-ink"
          )}
        >
          ONISHI
        </span>
        <span
          className={cn(
            "mt-0.5 text-[0.6rem] font-medium tracking-[0.32em]",
            light ? "text-cream/70" : "text-ink-soft"
          )}
        >
          AUTHENTIC SUSHI
        </span>
      </span>
    </Link>
  );
}
