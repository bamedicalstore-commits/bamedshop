import { Link } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuantitySelector } from "./QuantitySelector";
import { ShoppingCart, X, Pill, ArrowRight, Truck } from "lucide-react";
import { uiActions, useUiStore, selectors } from "@/hooks/useUiStore";
import { formatMoney } from "@/lib/format";

const FREE_SHIPPING_MINOR = 200_000; // 200 DT (3 decimals)

export function MiniCart() {
  const open = useUiStore((s) => s.overlays.miniCart);
  const lines = useUiStore((s) => s.cart);
  const subtotal = useUiStore(selectors.cartSubtotalMinor);
  const count = useUiStore(selectors.cartCount);

  const remaining = Math.max(0, FREE_SHIPPING_MINOR - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_MINOR) * 100));

  return (
    <Sheet
      open={open}
      onOpenChange={(o) =>
        o ? uiActions.openOverlay("miniCart") : uiActions.closeOverlay("miniCart")
      }
    >
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" aria-hidden="true" />
            Mon panier
            {count > 0 && <Badge variant="soft">{count}</Badge>}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Aperçu des articles ajoutés au panier
          </SheetDescription>

          {lines.length > 0 && (
            <div className="mt-2 rounded-lg bg-primary-soft/60 p-3">
              <p className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Truck className="size-3.5 text-primary" aria-hidden="true" />
                {remaining === 0 ? (
                  <span>Livraison offerte débloquée 🎉</span>
                ) : (
                  <span>
                    Plus que{" "}
                    <strong className="text-primary">
                      {formatMoney({ amount: remaining, currency: "TND" })}
                    </strong>{" "}
                    pour la livraison offerte
                  </span>
                )}
              </p>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-background"
              >
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <ShoppingCart className="size-10 text-muted-foreground/50" aria-hidden="true" />
              <h3 className="font-semibold">Votre panier est vide</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Parcourez le catalogue et ajoutez vos premiers produits.
              </p>
              <Button asChild size="sm" onClick={() => uiActions.closeOverlay("miniCart")}>
                <Link to="/catalogue">Voir le catalogue</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3 py-4">
                  <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-muted text-muted-foreground/40">
                    <Pill className="size-6" aria-hidden="true" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/product/$slug"
                        params={{ slug: line.product.slug }}
                        onClick={() => uiActions.closeOverlay("miniCart")}
                        className="line-clamp-2 text-sm font-medium hover:text-primary"
                      >
                        {line.product.name}
                      </Link>
                      <button
                        onClick={() => uiActions.removeFromCart(line.productId)}
                        aria-label={`Retirer ${line.product.name} du panier`}
                        className="rounded-full p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">{line.product.brand}</span>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <QuantitySelector
                        value={line.quantity}
                        onChange={(q) => uiActions.updateCartQty(line.productId, q)}
                        size="sm"
                      />
                      <span className="text-sm font-semibold">
                        {formatMoney({
                          amount: line.product.price.amount * line.quantity,
                          currency: line.product.price.currency,
                        })}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <SheetFooter className="flex-col gap-3 border-t border-border bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Sous-total</span>
              <span className="text-xl font-bold">
                {formatMoney({ amount: subtotal, currency: "TND" })}
              </span>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              TVA incluse — Frais de livraison au checkout
            </p>
            <Separator />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild variant="outline" onClick={() => uiActions.closeOverlay("miniCart")}>
                <Link to="/cart">Voir le panier</Link>
              </Button>
              <Button asChild size="lg" onClick={() => uiActions.closeOverlay("miniCart")}>
                <Link to="/checkout">
                  Commander <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
