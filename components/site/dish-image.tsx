import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Image de plat. Affiche la vraie photo si `src` est fournie (Supabase Storage
 * ou visuel Higgsfield), sinon un placeholder brandé propre — pour que la
 * maquette ne montre jamais d'image cassée en attendant les vraies photos.
 */
export function DishImage({
  src,
  alt,
  seed = 0,
  className,
  sizes,
}: {
  src?: string | null;
  alt: string;
  seed?: number;
  className?: string;
  sizes?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 50vw, 320px"}
        className={cn("object-cover", className)}
      />
    );
  }

  // Placeholder : dégradé chaud + motif de vagues + glyphe baguettes/maki.
  const tints = [
    ["#e9b27a", "#da693f"],
    ["#e8a04b", "#c8552c"],
    ["#f0c79a", "#d2773f"],
    ["#e7a96a", "#b9551f"],
  ];
  const [from, to] = tints[seed % tints.length];

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={`${alt} — photo à venir`}
    >
      <div className="absolute inset-0 wave-bg opacity-60" />
      <svg
        viewBox="0 0 64 64"
        className="relative h-12 w-12 text-cream/85"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        {/* maki */}
        <circle cx="26" cy="40" r="13" className="opacity-90" />
        <circle cx="26" cy="40" r="6" className="opacity-70" />
        {/* baguettes */}
        <path d="M14 8 L40 30" />
        <path d="M20 6 L44 26" />
      </svg>
    </div>
  );
}
