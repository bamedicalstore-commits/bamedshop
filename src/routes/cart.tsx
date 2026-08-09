import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2, Pill } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { QuantitySelector } from "@/components/ecommerce/QuantitySelector";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PriceBlock } from "@/components/ecommerce/PriceBlock";
import { MOCK_PRODUCTS } from "@/constants/navigation";
import { formatMoney } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Mon panier — BA Medical Store" },
      { name: "description", content: "Consultez et validez votre panier." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  // Mock cart state (UI only). Backend branchera le vrai panier.
  const [items, setItems] = useState(
    MOCK_PRODUCTS.slice(0, 2).map((p) => ({ product: p, qty: 1 })),
  );

  const subtotal = items.reduce((sum, i) => sum + i.product.price.amount * i.qty, 0);
  const shipping = subtotal > 200000 ? 0 : 8000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="container-page py-16">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            description="Parcourez notre catalogue pour trouver le matériel dont vous avez besoin."
            action={
              <Button asChild>
                <Link to="/catalogue">Voir le catalogue</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mon panier</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} article{items.length > 1 ? "s" : ""}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li key={item.product.id}>
                <Card className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto_auto]">
                  <div className="grid size-20 place-items-center rounded-md bg-surface-muted text-muted-foreground/40 sm:size-24">
                    <Pill className="size-8" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase text-muted-foreground">{item.product.brand}</p>
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.product.slug }}
                      className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-1 sm:hidden">
                      <PriceBlock price={item.product.price} />
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <QuantitySelector
                      value={item.qty}
                      onChange={(v) =>
                        setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, qty: v } : p)))
                      }
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="hidden sm:block">
                      <PriceBlock
                        price={{
                          ...item.product.price,
                          amount: item.product.price.amount * item.qty,
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Retirer ${item.product.name}`}
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="col-span-3 sm:hidden">
                    <QuantitySelector
                      value={item.qty}
                      onChange={(v) =>
                        setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, qty: v } : p)))
                      }
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <aside className="h-fit lg:sticky lg:top-24">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Récapitulatif</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sous-total</dt>
                  <dd className="font-medium">
                    {formatMoney({ amount: subtotal, currency: "TND" })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livraison</dt>
                  <dd className="font-medium">
                    {shipping === 0
                      ? "Offerte"
                      : formatMoney({ amount: shipping, currency: "TND" })}
                  </dd>
                </div>
              </dl>
              <Separator className="my-4" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total TTC</span>
                <span className="text-2xl font-bold tracking-tight">
                  {formatMoney({ amount: total, currency: "TND" })}
                </span>
              </div>
              <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
                <label htmlFor="coupon" className="sr-only">
                  Code promo
                </label>
                <Input id="coupon" placeholder="Code promo" className="h-10" />
                <Button type="submit" variant="outline">
                  Appliquer
                </Button>
              </form>
              <Button asChild size="lg" width="full" className="mt-6">
                <Link to="/checkout">Passer commande</Link>
              </Button>
              <Button asChild variant="ghost" width="full" className="mt-2">
                <Link to="/catalogue">Continuer mes achats</Link>
              </Button>
            </Card>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
