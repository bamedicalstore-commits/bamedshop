import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Truck, RotateCcw, Pill, Award } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { PriceBlock } from "@/components/ecommerce/PriceBlock";
import { Rating } from "@/components/ecommerce/Rating";
import { AvailabilityBadge } from "@/components/ecommerce/AvailabilityBadge";
import { QuantitySelector } from "@/components/ecommerce/QuantitySelector";
import { ProductImageGallery } from "@/components/ecommerce/ProductImageGallery";
import { MedicalBadges } from "@/components/ecommerce/MedicalBadges";
import { EmptyState } from "@/components/feedback/EmptyState";
import { getPublicProductBySlug } from "@/lib/catalog.functions";
import { toProduct } from "@/lib/mappers";
import { WhatsAppOrderButton } from "@/components/ecommerce/WhatsAppOrderButton";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const result = await getPublicProductBySlug({ data: { slug: params.slug } });
    if (result.error || !result.product) throw notFound();
    return { product: toProduct(result.product) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produit introuvable — BA Medical Store" }, { name: "robots", content: "noindex" }] };
    const { product } = loaderData;
    const description = product.description ?? product.shortDescription ?? product.name;
    return {
      meta: [
        { title: `${product.name} — BA Medical Store` },
        { name: "description", content: description.slice(0, 160) },
        { property: "og:title", content: product.name },
        { property: "og:description", content: description.slice(0, 200) },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [qty, setQty] = useState(1);

  return (
    <SiteLayout>
      <div className="container-page py-5 sm:py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/catalogue">Catalogue</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <article className="container-page grid gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        <div className="min-w-0"><ProductImageGallery images={product.images} alt={product.name} /></div>

        <div className="lg:pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand ? <Badge variant="soft">{product.brand}</Badge> : null}
            {product.isNew ? <Badge variant="info">Nouveau</Badge> : null}
            {product.isBestSeller ? <Badge variant="warning">Sélection</Badge> : null}
          </div>

          <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">{product.name}</h1>
          {product.reference || product.sku ? <p className="mt-2 text-xs text-muted-foreground">Réf. {product.reference ?? product.sku}</p> : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <PriceBlock price={product.price} compareAtPrice={product.compareAtPrice} size="xl" layout="col" />
            {product.rating !== undefined ? <Rating value={product.rating} count={product.ratingCount} size="md" showValue /> : null}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">Prix affiché en TND. Les frais et modalités de livraison sont confirmés lors de la commande.</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <AvailabilityBadge status={product.availability} />
            {product.certifications?.length ? <MedicalBadges kinds={product.certifications} /> : null}
          </div>

          {product.shortDescription ? <p className="mt-6 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p> : null}

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <QuantitySelector value={qty} onChange={setQty} />
              <WhatsAppOrderButton product={product} quantity={qty} size="lg" className="flex-1" label="Commander sur WhatsApp" disabled={product.availability === "out_of_stock" || product.availability === "unavailable"} />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Votre demande est préparée avec le produit et la quantité sélectionnés. Notre équipe confirme ensuite disponibilité et livraison.</p>
          </div>

          <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
            <FeatureLine icon={ShieldCheck}>Informations produit vérifiées avant commande</FeatureLine>
            <FeatureLine icon={Truck}>Livraison partout en Tunisie</FeatureLine>
            {product.warrantyMonths ? <FeatureLine icon={Award}>Garantie : {product.warrantyMonths} mois</FeatureLine> : null}
            <FeatureLine icon={RotateCcw}>Conseil et accompagnement par notre équipe</FeatureLine>
          </ul>

          {product.description ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold">À propos de ce produit</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.description}</p>
            </div>
          ) : null}
        </div>
      </article>
    </SiteLayout>
  );
}

function FeatureLine({ icon: Icon, children }: { icon: typeof ShieldCheck; children: React.ReactNode }) {
  return <li className="flex items-center gap-3 px-4 py-3.5 text-sm"><Icon className="size-4 shrink-0 text-primary" aria-hidden="true" /><span>{children}</span></li>;
}

function ProductNotFound() {
  return <SiteLayout><div className="container-page py-20"><EmptyState icon={Pill} title="Produit introuvable" description="Ce produit n'existe pas ou n'est plus disponible." action={<Button asChild><Link to="/catalogue">Voir le catalogue</Link></Button>} /></div></SiteLayout>;
}
