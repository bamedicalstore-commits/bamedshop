import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ShieldCheck, Truck, RotateCcw, Pill, Award } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { PriceBlock } from "@/components/ecommerce/PriceBlock";
import { Rating } from "@/components/ecommerce/Rating";
import { AvailabilityBadge } from "@/components/ecommerce/AvailabilityBadge";
import { QuantitySelector } from "@/components/ecommerce/QuantitySelector";
import { AddToCartButton } from "@/components/ecommerce/AddToCartButton";
import { WishlistButton } from "@/components/ecommerce/WishlistButton";
import { CompareToggleButton } from "@/components/ecommerce/CompareDrawer";
import { ProductImageGallery } from "@/components/ecommerce/ProductImageGallery";
import { ProductTabs } from "@/components/ecommerce/ProductTabs";
import { StickyAddToCart } from "@/components/ecommerce/StickyAddToCart";
import { MedicalBadges } from "@/components/ecommerce/MedicalBadges";
import { FrequentlyBoughtTogether } from "@/components/ecommerce/FrequentlyBoughtTogether";
import { SimilarProducts } from "@/components/ecommerce/SimilarProducts";
import { EmptyState } from "@/components/feedback/EmptyState";
import { MOCK_PRODUCTS } from "@/constants/navigation";

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
  const primaryCtaRef = useRef<HTMLDivElement>(null);

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
        <ProductImageGallery images={product.images} alt={product.name} />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex flex-wrap items-center gap-2">
            <AvailabilityBadge status={product.availability} />
            <MedicalBadges kinds={["ce", "iso-13485", "latex-free"]} />
          </div>

          <Separator />

          <div ref={primaryCtaRef} className="flex flex-wrap items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} />
            <AddToCartButton
              product={product}
              quantity={qty}
              size="lg"
              className="flex-1"
              disabled={product.availability === "out_of_stock"}
            />
            <WishlistButton productId={product.id} />
            <CompareToggleButton product={product} size="md" />
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
        <ProductTabs product={product} />
      </section>

      <section className="container-page pb-14 animate-fade-in">
        <FrequentlyBoughtTogether product={product} />
      </section>

      <section className="container-page pb-20">
        <SimilarProducts product={product} />
      </section>

      <StickyAddToCart product={product} triggerRef={primaryCtaRef} />
    </SiteLayout>
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
