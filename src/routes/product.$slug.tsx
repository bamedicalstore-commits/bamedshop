import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck, Truck, RotateCcw, Pill, Info, FileText, Award,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { PriceBlock } from "@/components/ecommerce/PriceBlock";
import { Rating } from "@/components/ecommerce/Rating";
import { AvailabilityBadge } from "@/components/ecommerce/AvailabilityBadge";
import { QuantitySelector } from "@/components/ecommerce/QuantitySelector";
import { AddToCartButton } from "@/components/ecommerce/AddToCartButton";
import { WishlistButton } from "@/components/ecommerce/WishlistButton";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { MOCK_PRODUCTS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const p = MOCK_PRODUCTS.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return { slug: p.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produit introuvable" }, { name: "robots", content: "noindex" }] };
    const p = MOCK_PRODUCTS.find((x) => x.slug === loaderData.slug)!;
    const desc = p.shortDescription ?? `${p.name} — ${p.brand}`;
    return {
      meta: [
        { title: `${p.name} — BA Medical Store` },
        { name: "description", content: desc },
        { property: "og:title", content: p.name },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug)!;
  const [qty, setQty] = useState(1);
  const related = MOCK_PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id,
  ).slice(0, 4);

  return (
    <SiteLayout>
      <div className="container-page py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/catalogue">Catalogue</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/categories/${product.categorySlug}`}>
                {product.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <article className="container-page grid gap-10 pb-14 lg:grid-cols-[minmax(0,1fr)_440px]">
        <ProductGallery />

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="soft">{product.brand}</Badge>
            {product.isNew && <Badge variant="info">Nouveau</Badge>}
            {product.isBestSeller && <Badge variant="warning">Best-seller</Badge>}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
            {product.reference && (
              <p className="mt-1 text-xs text-muted-foreground">Réf. {product.reference}</p>
            )}
          </div>

          {product.rating && (
            <Rating value={product.rating} count={product.ratingCount} size="md" showValue />
          )}

          <PriceBlock
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="xl"
            layout="col"
          />
          <p className="text-xs text-muted-foreground">TVA incluse — Hors frais de livraison</p>

          <AvailabilityBadge status={product.availability} />

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} />
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              quantity={qty}
              size="lg"
              className="flex-1"
              disabled={product.availability === "out_of_stock"}
            />
            <WishlistButton productId={product.id} />
          </div>

          {product.shortDescription && (
            <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
          )}

          <ul className="grid gap-2 rounded-lg border border-border bg-surface p-4 text-sm">
            <FeatureLine icon={ShieldCheck}>Produit certifié CE, traçabilité garantie</FeatureLine>
            <FeatureLine icon={Truck}>Livraison sous 24-48h · offerte dès 200 DT</FeatureLine>
            <FeatureLine icon={RotateCcw}>Retour sous 14 jours</FeatureLine>
            <FeatureLine icon={Award}>Support pro dédié aux professionnels de santé</FeatureLine>
          </ul>
        </div>
      </article>

      <section className="container-page pb-14">
        <Tabs defaultValue="desc">
          <TabsList>
            <TabsTrigger value="desc"><Info aria-hidden="true" /> Description</TabsTrigger>
            <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
            <TabsTrigger value="docs"><FileText aria-hidden="true" /> Documents</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>
          <TabsContent value="desc" className="prose prose-sm max-w-none py-6 text-foreground">
            <p className="text-muted-foreground">
              {product.description ??
                `${product.name} — un équipement fiable, conçu pour un usage professionnel intensif. Description détaillée à compléter au branchement du catalogue.`}
            </p>
          </TabsContent>
          <TabsContent value="specs" className="py-6">
            <dl className="grid gap-3 sm:grid-cols-2">
              <SpecRow label="Marque" value={product.brand} />
              <SpecRow label="Catégorie" value={product.category} />
              <SpecRow label="Référence" value={product.reference ?? "—"} />
              <SpecRow label="SKU" value={product.sku ?? "—"} />
            </dl>
          </TabsContent>
          <TabsContent value="docs" className="py-6">
            <EmptyState icon={FileText} title="Aucun document" description="Les fiches techniques seront disponibles prochainement." />
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            <EmptyState icon={Award} title="Aucun avis pour le moment" description="Soyez le premier à laisser un avis." />
          </TabsContent>
        </Tabs>
      </section>

      {related.length > 0 && (
        <section className="container-page pb-14">
          <SectionHeader title="Produits similaires" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function ProductGallery() {
  const [active, setActive] = useState(0);
  const thumbs = [0, 1, 2, 3];
  return (
    <div className="grid gap-3 lg:grid-cols-[80px_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col">
        {thumbs.map((i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Image ${i + 1}`}
            aria-current={active === i}
            className={cn(
              "grid size-20 shrink-0 place-items-center rounded-md border bg-surface-muted text-muted-foreground/40 transition-colors",
              active === i ? "border-primary" : "border-border hover:border-input",
            )}
          >
            <Pill className="size-6" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="order-1 lg:order-2">
        <div className="grid aspect-square place-items-center overflow-hidden rounded-xl border border-border bg-surface-muted text-muted-foreground/30">
          <Pill className="size-32" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function FeatureLine({ icon: Icon, children }: { icon: typeof ShieldCheck; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="text-foreground">{children}</span>
    </li>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function ProductNotFound() {
  return (
    <SiteLayout>
      <div className="container-page py-20">
        <EmptyState
          icon={Pill}
          title="Produit introuvable"
          description="Ce produit n'existe pas ou n'est plus disponible."
          action={<Button asChild><Link to="/catalogue">Voir le catalogue</Link></Button>}
        />
      </div>
    </SiteLayout>
  );
}
