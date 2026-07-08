import { cn } from "@/lib/utils";
import { formatMoney, discountFromCompare } from "@/lib/format";
import type { Money } from "@/types/product";

interface PriceBlockProps {
  price: Money;
  compareAtPrice?: Money;
  size?: "sm" | "md" | "lg" | "xl";
  layout?: "row" | "col";
  className?: string;
}

const SIZE_STYLES = {
  sm: { price: "text-sm font-semibold", compare: "text-xs" },
  md: { price: "text-base font-semibold", compare: "text-sm" },
  lg: { price: "text-xl font-bold", compare: "text-sm" },
  xl: { price: "text-3xl font-bold tracking-tight", compare: "text-base" },
} as const;

export function PriceBlock({
  price,
  compareAtPrice,
  size = "md",
  layout = "row",
  className,
}: PriceBlockProps) {
  const styles = SIZE_STYLES[size];
  const discount = discountFromCompare(price, compareAtPrice);

  return (
    <div
      className={cn(
        "flex items-baseline gap-2",
        layout === "col" && "flex-col items-start gap-1",
        className,
      )}
    >
      <span className={cn(styles.price, "text-foreground")}>{formatMoney(price)}</span>
      {compareAtPrice && (
        <span className={cn(styles.compare, "text-muted-foreground line-through")}>
          {formatMoney(compareAtPrice)}
        </span>
      )}
      {discount !== undefined && (
        <span className={cn(styles.compare, "font-semibold text-success")}>-{discount}%</span>
      )}
    </div>
  );
}
