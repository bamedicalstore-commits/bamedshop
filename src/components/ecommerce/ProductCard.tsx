import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceBlock } from "./PriceBlock";
import { Rating } from "./Rating";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButton } from "./AddToCartButton";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Pill } from "lucide-react";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  className?: string;
}

export function ProductCard({ product, layout = "grid", className }: ProductCardProps) {
  const outOfStock = product.availability === "out_of_stock";
  return (
    <Card
      className={cn(
        "group relative flex overflow-hidden border-border/70 p-0 transition-all hover:shadow-[var(--shadow-elevated)]",
        layout === "grid" ? "flex-col" : "flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-surface-muted",
          layout === "grid" ? "aspect-square w-full" : "aspect-square w-40 sm:w-48",
        )}
      >
        <div className="flex size-full items-center justify-center text-muted-foreground/40">
          <Pill className="size-16" aria-hidden="true" />
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="info">Nouveau</Badge>}
          {product.isBestSeller && <Badge variant="soft">Best-seller</Badge>}
          {product.compareAtPrice && <Badge variant="destructive">Promo</Badge>}
        </div>
        <div className="absolute right-3 top-3">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-4",
          layout === "list" && "sm:p-5",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <AvailabilityBadge status={product.availability} />
        </div>

        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        {product.shortDescription && layout === "list" && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        {product.rating !== undefined && (
          <Rating value={product.rating} count={product.ratingCount} />
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <PriceBlock
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="lg"
          />
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            size="sm"
            disabled={outOfStock}
            aria-label={`Ajouter ${product.name} au panier`}
            label="Ajouter"
          />
        </div>
      </div>
    </Card>
  );
}
