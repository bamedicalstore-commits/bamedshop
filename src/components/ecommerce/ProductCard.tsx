import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceBlock } from "./PriceBlock";
import { Rating } from "./Rating";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButton } from "./AddToCartButton";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { CompareToggleButton } from "./CompareDrawer";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Pill, Eye, Truck, Repeat, ShieldCheck, Plug, Stethoscope } from "lucide-react";
import { uiActions } from "@/hooks/useUiStore";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  className?: string;
}

export function ProductCard({ product, layout = "grid", className }: ProductCardProps) {
  const outOfStock =
    product.availability === "out_of_stock" || product.availability === "unavailable";
  const image = product.images?.[0];
  const chips = buildChips(product);
  return (
    <Card
      className={cn(
        "group relative flex overflow-hidden border-border/70 p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
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
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40 transition-transform duration-500 group-hover:scale-105">
            <Pill className="size-16" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="info">Nouveau</Badge>}
          {product.isBestSeller && <Badge variant="soft">Best-seller</Badge>}
          {product.compareAtPrice && <Badge variant="destructive">Promo</Badge>}
          {product.prescriptionRequired && (
            <Badge variant="warning" aria-label="Sur ordonnance">
              <Stethoscope aria-hidden="true" /> Rx
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <WishlistButton productId={product.id} />
          <CompareToggleButton product={product} />
        </div>

        {/* Quick view — apparaît au hover (desktop), toujours visible sur tactile */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:opacity-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            width="full"
            onClick={() => uiActions.openQuickView(product)}
            className="bg-background/95 backdrop-blur"
          >
            <Eye aria-hidden="true" /> Aperçu rapide
          </Button>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col gap-3 p-4", layout === "list" && "sm:p-5")}>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        )}

        {product.rating !== undefined && (
          <Rating value={product.rating} count={product.ratingCount} />
        )}

        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Avantages produit">
            {chips.map((c) => (
              <li key={c.label}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground",
                    c.emphasis && "border-primary/30 bg-primary-soft text-primary",
                  )}
                >
                  <c.Icon className="size-3" aria-hidden="true" />
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <PriceBlock price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          <AddToCartButton
            product={product}
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

/** Petits chips métier affichés sous les infos produit. */
function buildChips(product: Product) {
  const chips: { label: string; Icon: typeof Truck; emphasis?: boolean }[] = [];
  if (product.deliveryEta) chips.push({ label: `Livré ${product.deliveryEta}`, Icon: Truck });
  if (product.subscriptionEligible)
    chips.push({ label: "Abonnement", Icon: Repeat, emphasis: true });
  if (product.warrantyMonths)
    chips.push({ label: `Garantie ${product.warrantyMonths} mois`, Icon: ShieldCheck });
  if (product.compatibleWith && product.compatibleWith.length > 0)
    chips.push({
      label: `${product.compatibleWith.length} compat.`,
      Icon: Plug,
    });
  return chips.slice(0, 3);
}
