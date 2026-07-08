import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
  ariaLabel?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  ariaLabel = "Quantité",
}: QuantitySelectorProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center rounded-md border border-input bg-background",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={dec}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className="h-full w-10 rounded-r-none"
      >
        <Minus />
      </Button>
      <span
        className="min-w-8 text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={inc}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className="h-full w-10 rounded-l-none"
      >
        <Plus />
      </Button>
    </div>
  );
}
