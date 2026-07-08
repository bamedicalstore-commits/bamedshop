import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageLoader({ className, label = "Chargement…" }: { className?: string; label?: string }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-16", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
