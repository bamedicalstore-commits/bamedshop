import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Trash2, Pill } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QuantitySelector } from "@/components/ecommerce/QuantitySelector";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import {
  clearCurrentCart,
  getCurrentCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart.functions";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Mon panier — BA Medical Store" },
      { name: "description", content: "Consultez votre panier BA Medical Store." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

type CartProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  currency: string;
  active: boolean;
  brand: { name: string; slug: string } | null;
  media: Array<{ url: string; position: number }>;
};

type CartLine = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: CartProduct | null;
};

function toMoney(amountMajor: number, currency: string) {
  return { amount: Math.round(Number(amountMajor) * (currency === "TND" ? 1000 : 100)), currency };
}

function CartPage() {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<"checking" | "guest" | "authenticated">("checking");

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthState(data.session ? "authenticated" : "guest");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setAuthState(session ? "authenticated" : "guest");
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchCart = getCurrentCart;
  const { data, isPending, isError } = useQuery({
    queryKey: ["current-cart"],
    queryFn: () => fetchCart(),
    enabled: authState === "authenticated",
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (input: { itemId: string; quantity: number }) => updateCartItem({ data: input }),
    onSuccess: (result) => queryClient.setQueryData(["current-cart"], result),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem({ data: { itemId } }),
    onSuccess: (result) => queryClient.setQueryData(["current-cart"], result),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearCurrentCart(),
    onSuccess: (result) => queryClient.setQueryData(["current-cart"], result),
  });

  const lines = useMemo(
    () => ((data?.cart?.cart_items ?? []) as unknown as CartLine[]),
    [data],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + Number(line.unit_price) * line.quantity, 0),
    [lines],
  );

  if (authState === "checking") {
    return (
      <SiteLayout>
        <div className="container-page py-10">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-8 h-32 w-full" />
        </div>
      </SiteLayout>
    );
  }

  if (authState === "guest") {
    return (
      <SiteLayout>
        <div className="container-page py-16">
          <EmptyState
            icon={ShoppingBag}
            title="Connectez-vous pour accéder à votre panier"
            description="Votre panier est associé à votre compte afin de conserver vos articles de manière sécurisée."
            action={
              <Button asChild>
                <Link to="/auth">Se connecter</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  if (isPending) {
    return (
      <SiteLayout>
        <div className="container-page py-10">
          <Skeleton className="h-10 w-48" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (isError || data?.error) {
    return (
      <SiteLayout>
        <div className="container-page py-16">
          <ErrorState description="Impossible de charger votre panier. Veuillez réessayer." />
        </div>
      </SiteLayout>
    );
  }

  if (lines.length === 0) {
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mon panier</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {lines.reduce((sum, line) => sum + line.quantity, 0)} article(s)
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            Vider le panier
          </Button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ul className="space-y-3">
            {lines.map((line) => {
              const product = line.product;
              const currency = product?.currency ?? "TND";
              const unitMoney = toMoney(Number(line.unit_price), currency);
              const lineMoney = toMoney(Number(line.unit_price) * line.quantity, currency);
              const image = product?.media?.slice().sort((a, b) => a.position - b.position)[0]?.url;

              return (
                <li key={line.id}>
                  <Card className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto_auto]">
                    <div className="grid size-20 place-items-center overflow-hidden rounded-md bg-surface-muted text-muted-foreground/40 sm:size-24">
                      {image ? (
                        <img src={image} alt={product?.name ?? "Produit"} className="size-full object-cover" loading="lazy" />
                      ) : (
                        <Pill className="size-8" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase text-muted-foreground">{product?.brand?.name ?? "BA Medical Store"}</p>
                      {product ? (
                        <Link
                          to="/product/$slug"
                          params={{ slug: product.slug }}
                          className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-destructive">Produit indisponible</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">Réf. {product?.sku ?? line.product_id}</p>
                      <div className="mt-1 sm:hidden">{formatMoney(unitMoney)}</div>
                    </div>
                    <div className="hidden sm:block">
                      <QuantitySelector
                        value={line.quantity}
                        onChange={(value) => updateMutation.mutate({ itemId: line.id, quantity: value })}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="hidden sm:block font-semibold">{formatMoney(lineMoney)}</div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Retirer ${product?.name ?? "le produit"}`}
                        onClick={() => removeMutation.mutate(line.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="col-span-3 sm:hidden">
                      <QuantitySelector
                        value={line.quantity}
                        onChange={(value) => updateMutation.mutate({ itemId: line.id, quantity: value })}
                      />
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit lg:sticky lg:top-24">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Récapitulatif</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sous-total</dt>
                  <dd className="font-medium">{formatMoney(toMoney(subtotal, "TND"))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Livraison</dt>
                  <dd className="font-medium text-muted-foreground">Calculée au checkout</dd>
                </div>
              </dl>
              <Separator className="my-4" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total provisoire</span>
                <span className="text-2xl font-bold tracking-tight">{formatMoney(toMoney(subtotal, "TND"))}</span>
              </div>
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
