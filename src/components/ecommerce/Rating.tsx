import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const SIZES = { sm: "size-3", md: "size-4", lg: "size-5" };

export function Rating({ value, count, size = "sm", showValue, className }: RatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(value));
  const iconClass = SIZES[size];
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Note ${value.toFixed(1)} sur 5${count ? `, ${count} avis` : ""}`}
    >
      <div className="flex">
        {stars.map((filled, i) => (
          <Star
            key={i}
            className={cn(
              iconClass,
              filled ? "fill-warning text-warning" : "fill-muted text-muted",
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-foreground">{value.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
