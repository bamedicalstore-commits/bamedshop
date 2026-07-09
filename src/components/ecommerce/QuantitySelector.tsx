import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
  ariaLabel = "Quantité",
}: QuantitySelectorProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const isSm = size === "sm";
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-input bg-background",
        isSm ? "h-8" : "h-10",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <Button
        type="button"
        variant="ghost"
        size={isSm ? "icon-sm" : "icon-sm"}
        onClick={dec}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className={cn("h-full rounded-r-none", isSm ? "w-8" : "w-10")}
      >
        <Minus />
      </Button>
      <span
        className={cn(
          "text-center font-semibold tabular-nums",
          isSm ? "min-w-6 text-xs" : "min-w-8 text-sm",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={inc}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className={cn("h-full rounded-l-none", isSm ? "w-8" : "w-10")}
      >
        <Plus />
      </Button>
    </div>
  );
}
