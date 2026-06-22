import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-[var(--radius)] border border-sand-deep bg-white px-3.5 text-sm text-ink",
      "placeholder:text-ink-soft/50 transition-colors",
      "focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[88px] w-full rounded-[var(--radius)] border border-sand-deep bg-white px-3.5 py-2.5 text-sm text-ink",
      "placeholder:text-ink-soft/50 transition-colors",
      "focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}
