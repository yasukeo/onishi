"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  onChange,
  size = 18,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  const interactive = !!onChange;
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={cn(interactive && "cursor-pointer transition-transform hover:scale-110", !interactive && "cursor-default")}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? "fill-ember text-ember" : "fill-transparent text-sand-deep"}
          />
        </button>
      ))}
    </div>
  );
}
