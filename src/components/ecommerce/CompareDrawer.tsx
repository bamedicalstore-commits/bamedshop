import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceBlock } from "./PriceBlock";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { Rating } from "./Rating";
import { X, Pill, Scale, GitCompareArrows } from "lucide-react";
import { uiActions, useUiStore, COMPARE_LIMIT } from "@/hooks/useUiStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export function CompareDrawer() {
  const open = useUiStore((s) => s.overlays.compare);
  const items = useUiStore((s) => s.compare);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => (o ? uiActions.openOverlay("compare") : uiActions.closeOverlay("compare"))}
    >
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto p-0">
        <SheetHeader className="flex-row items-center justify-between border-b border-border p-5">
          <div>
            <SheetTitle className="flex items-center gap-2">
              <Scale className="size-5 text-primary" aria-hidden="true" />
              Comparer <Badge variant="soft">{items.length}/{COMPARE_LIMIT}</Badge>
            </SheetTitle>
            <SheetDescription>
              Comparez jusqu'à {COMPARE_LIMIT} produits côte à côte.
            </SheetDescription>
          </div>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => uiActions.clearCompare()}>
              Tout effacer
            </Button>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-14 text-center">
            <GitCompareArrows className="size-10 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="text-base font-semibold">Aucun produit à comparer</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajoutez des produits depuis le catalogue pour les comparer sur cette vue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-5">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `160px repeat(${items.length}, minmax(220px, 1fr))` }}
            >
              <RowLabel>Produit</RowLabel>
              {items.map((p) => <CompareHeader key={p.id} product={p} />)}

              <RowLabel>Prix</RowLabel>
              {items.map((p) => (
                <div key={p.id} className="border-t border-border py-3">
                  <PriceBlock price={p.price} compareAtPrice={p.compareAtPrice} size="md" />
                </div>
              ))}

              <RowLabel>Note</RowLabel>
              {items.map((p) => (
                <div key={p.id} className="border-t border-border py-3">
                  {p.rating ? <Rating value={p.rating} count={p.ratingCount} size="sm" /> : "—"}
                </div>
              ))}

              <RowLabel>Disponibilité</RowLabel>
              {items.map((p) => (
                <div key={p.id} className="border-t border-border py-3">
                  <AvailabilityBadge status={p.availability} />
                </div>
              ))}

              <RowLabel>Marque</RowLabel>
              {items.map((p) => (
                <div key={p.id} className="border-t border-border py-3 text-sm">
                  {p.brand}
                </div>
              ))}

              <RowLabel>Catégorie</RowLabel>
              {items.map((p) => (
                <div key={p.id} className="border-t border-border py-3 text-sm">
                  {p.category}
                </div>
              ))}

              <RowLabel>Référence</RowLabel>
              {items.map((p) => (
                <div key={p.id} className="border-t border-border py-3 text-sm text-muted-foreground">
                  {p.reference ?? "—"}
                </div>
              ))}

              <RowLabel>Action</RowLabel>
              {items.map((p) => (
                <div key={p.id} className="border-t border-border py-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      uiActions.addToCart(p);
                      uiActions.closeOverlay("compare");
                    }}
                    disabled={p.availability === "out_of_stock"}
                    className="w-full"
                  >
                    Ajouter au panier
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky left-0 flex items-center border-t border-border bg-background py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

function CompareHeader({ product }: { product: Product }) {
  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-border p-3">
      <button
        onClick={() => uiActions.toggleCompare(product)}
        className="absolute right-2 top-2 rounded-full bg-background/90 p-1 text-muted-foreground shadow-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Retirer ${product.name} de la comparaison`}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <div className="grid aspect-square place-items-center overflow-hidden rounded-md bg-surface-muted text-muted-foreground/30">
        <Pill className="size-10" aria-hidden="true" />
      </div>
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        onClick={() => uiActions.closeOverlay("compare")}
        className={cn("line-clamp-2 text-sm font-semibold hover:text-primary")}
      >
        {product.name}
      </Link>
    </div>
  );
}

/** Small floating button — shown on all listing pages when there's ≥1 item. */
export function CompareFab() {
  const count = useUiStore((s) => s.compare.length);
  if (count === 0) return null;
  return (
    <div className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
      <Button
        variant="floating"
        onClick={() => uiActions.openOverlay("compare")}
        aria-label={`Ouvrir la comparaison (${count} produits)`}
        className="h-12 gap-2 px-5"
      >
        <Scale className="size-4" aria-hidden="true" />
        Comparer
        <Badge variant="default" className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground">
          {count}
        </Badge>
      </Button>
    </div>
  );
}

interface CompareToggleButtonProps {
  product: Product;
  size?: "sm" | "md";
  className?: string;
}

export function CompareToggleButton({ product, size = "sm", className }: CompareToggleButtonProps) {
  const active = useUiStore((s) => s.compare.some((p) => p.id === product.id));
  const disabledFull = useUiStore((s) => s.compare.length >= COMPARE_LIMIT) && !active;
  return (
    <Button
      variant="outline"
      size={size === "sm" ? "icon-sm" : "icon"}
      onClick={() => uiActions.toggleCompare(product)}
      aria-label={active ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
      aria-pressed={active}
      disabled={disabledFull}
      className={cn(
        "rounded-full border-transparent bg-background/90 shadow-sm backdrop-blur",
        active && "text-primary ring-1 ring-primary",
        className,
      )}
    >
      <Scale aria-hidden="true" />
    </Button>
  );
}
