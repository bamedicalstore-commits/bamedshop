import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceBlock } from "./PriceBlock";
import { Rating } from "./Rating";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { WhatsAppOrderButton } from "./WhatsAppOrderButton";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Pill, ArrowUpRight, Truck, ShieldCheck, Plug, Stethoscope } from "lucide-react";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  className?: string;
}

export function ProductCard({ product, layout = "grid", className }: ProductCardProps) {
  const unavailable =
    product.availability === "out_of_stock" || product.availability === "unavailable";
  const image = product.images?.[0];
  const chips = buildChips(product);

  return (
    <Card
      className={cn(
        "group flex overflow-hidden border-border/80 bg-card p-0 shadow-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-elevated)]",
        layout === "grid" ? "flex-col" : "flex-row",
        className,
      )}
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className={cn(
          "relative block shrink-0 overflow-hidden bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          layout === "grid" ? "aspect-square w-full" : "aspect-square w-36 sm:w-44",
        )}
        aria-label={`Voir ${product.name}`}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/30">
            <Pill className="size-14" aria-hidden="true" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isNew && <Badge variant="info">Nouveau</Badge>}
          {product.isBestSeller && <Badge variant="soft">Sélection</Badge>}
          {product.compareAtPrice && <Badge variant="destructive">Offre</Badge>}
        </div>

        <span className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </Link>

      <div className={cn("flex flex-1 flex-col gap-3 p-4 sm:p-5", layout === "list" && "sm:p-5")}>
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {product.brand}
          </span>
          <AvailabilityBadge status={product.availability} />
        </div>

        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-[15px] font-semibold leading-5 tracking-[-0.01em] text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        {product.shortDescription && layout === "list" && (
          <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        {product.rating !== undefined && (
          <Rating value={product.rating} count={product.ratingCount} />
        )}

        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Informations produit">
            {chips.map((chip) => (
              <li key={chip.label}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground",
                    chip.emphasis && "border-primary/20 bg-primary-soft text-primary",
                  )}
                >
                  <chip.Icon className="size-3" aria-hidden="true" />
                  {chip.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-border/70 pt-3 sm:flex-row sm:items-end sm:justify-between">
          <PriceBlock price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          <WhatsAppOrderButton
            product={product}
            size="sm"
            disabled={unavailable}
            label="Commander"
            aria-label={`Commander ${product.name} sur WhatsApp`}
          />
        </div>
      </div>
    </Card>
  );
}

function buildChips(product: Product) {
  const chips: { label: string; Icon: typeof Truck; emphasis?: boolean }[] = [];
  if (product.deliveryEta) chips.push({ label: `Livré ${product.deliveryEta}`, Icon: Truck });
  if (product.warrantyMonths) chips.push({ label: `Garantie ${product.warrantyMonths} mois`, Icon: ShieldCheck });
  if (product.compatibleWith?.length)
    chips.push({ label: `${product.compatibleWith.length} compat.`, Icon: Plug });
  if (product.prescriptionRequired)
    chips.push({ label: "Ordonnance", Icon: Stethoscope, emphasis: true });
  return chips.slice(0, 3);
}
