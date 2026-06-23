import { cn } from "@/lib/utils";

/** Bloc de chargement (shimmer) aux tons de la marque. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius)] bg-sand-deep/60", className)}
      aria-hidden
    />
  );
}

/** Carte de plat fantôme pour la grille du menu. */
export function MenuCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-sand-deep bg-white/60">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full rounded-[var(--radius)]" />
      </div>
    </div>
  );
}
