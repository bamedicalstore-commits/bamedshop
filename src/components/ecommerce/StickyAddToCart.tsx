import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./QuantitySelector";
import { Pill, ShoppingCart } from "lucide-react";
import { uiActions } from "@/hooks/useUiStore";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface StickyAddToCartProps {
  product: Product;
  /** Element to observe — sticky bar shows only after it scrolls out of view. */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Mobile-only sticky bottom bar for product detail.
 * WCAG: role=region, uses safe-area padding, tap targets ≥44px.
 */
export function StickyAddToCart({ product, triggerRef }: StickyAddToCartProps) {
  const [visible, setVisible] = useState(!triggerRef);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const el = triggerRef?.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "-80px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [triggerRef]);

  const outOfStock = product.availability === "out_of_stock";

  return (
    <div
      role="region"
      aria-label="Ajout rapide au panier"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-8px_24px_-8px_oklch(0.2_0.02_240/0.12)] backdrop-blur transition-transform lg:hidden",
        "pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-3 px-4",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-muted text-muted-foreground/40">
          <Pill className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted-foreground">{product.brand}</p>
          <p className="truncate text-sm font-bold">{formatMoney(product.price)}</p>
        </div>
        <QuantitySelector value={qty} onChange={setQty} size="sm" />
        <Button
          size="lg"
          className="min-h-11 shrink-0"
          disabled={outOfStock}
          onClick={() => uiActions.addToCart(product, qty)}
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingCart aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Ajouter</span>
        </Button>
      </div>
    </div>
  );
}
