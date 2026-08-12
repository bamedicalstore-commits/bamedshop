import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceBlock } from "./PriceBlock";
import { Rating } from "./Rating";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { QuantitySelector } from "./QuantitySelector";
import { WishlistButton } from "./WishlistButton";
import { Pill, ArrowRight, ShoppingCart } from "lucide-react";
import { uiActions, useUiStore } from "@/hooks/useUiStore";

export function QuickView() {
  const open = useUiStore((s) => s.overlays.quickView);
  const product = useUiStore((s) => s.quickViewProduct);
  const [qty, setQty] = useState(1);

  return (
    <Dialog
      open={open && product !== null}
      onOpenChange={(o) => {
        if (!o) {
          uiActions.closeQuickView();
          setQty(1);
        }
      }}
    >
      <DialogContent className="max-w-3xl p-0">
        {product && (
          <div className="grid gap-0 md:grid-cols-2">
            <div className="grid aspect-square place-items-center border-b border-border bg-surface-muted text-muted-foreground/30 md:border-b-0 md:border-r">
              <Pill className="size-32" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <DialogHeader className="space-y-2 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="soft">{product.brand}</Badge>
                  {product.isNew && <Badge variant="info">Nouveau</Badge>}
                </div>
                <DialogTitle className="text-xl">{product.name}</DialogTitle>
                <DialogDescription>
                  {product.shortDescription ??
                    "Aperçu rapide — consultez la fiche complète pour tous les détails."}
                </DialogDescription>
              </DialogHeader>

              {product.rating && (
                <Rating value={product.rating} count={product.ratingCount} showValue size="sm" />
              )}

              <PriceBlock
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
                layout="col"
              />

              <AvailabilityBadge status={product.availability} />

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                <QuantitySelector value={qty} onChange={setQty} />
                <Button
                  onClick={() => {
                    addToCart(product, qty);
                    uiActions.closeQuickView();
                    setQty(1);
                  }}
                  disabled={product.availability === "out_of_stock"}
                  className="flex-1"
                >
                  <ShoppingCart aria-hidden="true" />
                  Ajouter au panier
                </Button>
                <WishlistButton productId={product.id} />
              </div>

              <Button
                asChild
                variant="link"
                className="justify-start px-0"
                onClick={() => uiActions.closeQuickView()}
              >
                <Link to="/product/$slug" params={{ slug: product.slug }}>
                  Voir la fiche complète <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
