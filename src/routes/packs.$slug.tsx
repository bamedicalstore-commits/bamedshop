import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { findPack } from "@/constants/health-packs";
import { MOCK_PRODUCTS } from "@/constants/navigation";
import { Package } from "lucide-react";

export const Route = createFileRoute("/packs/$slug")({
  loader: ({ params }) => {
    const p = findPack(params.slug);
    if (!p) throw notFound();
    return { slug: p.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Pack introuvable" }, { name: "robots", content: "noindex" }] };
    const p = findPack(loaderData.slug)!;
    return {
      meta: [
        { title: `${p.name} — BA Medical Store` },
        { name: "description", content: p.description },
      ],
    };
  },
  component: PackDetail,
  notFoundComponent: () => (
    <div className="container-page py-20">
      <EmptyState
        icon={Package}
        title="Pack introuvable"
        action={
          <Button asChild>
            <Link to="/packs">Retour aux packs</Link>
          </Button>
        }
      />
    </div>
  ),
});

function PackDetail() {
  const { slug } = Route.useLoaderData();
  const pack = findPack(slug)!;
  const products = MOCK_PRODUCTS.filter((p) => pack.productSlugs.includes(p.slug));

  return (
    <div className="container-page py-10">
      <Link
        to="/packs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Tous les packs
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`grid size-14 place-items-center rounded-2xl ${pack.color}`}>
                <pack.icon className="size-7" aria-hidden="true" />
              </span>
              <Badge variant="soft">{pack.savings}</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{pack.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{pack.tagline}</p>
          </div>

          <p className="text-base text-foreground">{pack.description}</p>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Pour qui ?</h2>
            <p className="text-sm text-muted-foreground">{pack.audience}</p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Ce pack inclut</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {pack.categories.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-sm"
                >
                  <Check className="size-4 text-primary" aria-hidden="true" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {products.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Produits sélectionnés</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h3 className="text-base font-semibold">Commander ce pack</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Livraison 24-48h · Devis pro sur demande
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button size="lg">
                <ShoppingCart className="size-4" aria-hidden="true" /> Ajouter au panier
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Demander un devis</Link>
              </Button>
            </div>
            <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
              <li>✓ Produits certifiés CE</li>
              <li>✓ Support pro dédié</li>
              <li>✓ Retour sous 14 jours</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
