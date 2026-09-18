import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShieldCheck, Truck, Award, Pill, FileText } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PriceBlock } from "@/components/ecommerce/PriceBlock";
import { AvailabilityBadge } from "@/components/ecommerce/AvailabilityBadge";
import { ProductImageGallery } from "@/components/ecommerce/ProductImageGallery";
import { MedicalBadges } from "@/components/ecommerce/MedicalBadges";
import { EmptyState } from "@/components/feedback/EmptyState";
import { WhatsAppOrderButton } from "@/components/ecommerce/WhatsAppOrderButton";
import { getPublicProductBySlug } from "@/lib/catalog.functions";
import { toProduct } from "@/lib/mappers";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const result = await getPublicProductBySlug({ data: { slug: params.slug } });
    if (result.error || !result.product) throw notFound();
    return { product: toProduct(result.product) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Produit introuvable — BA Medical Store" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const { product } = loaderData;
    const description = product.description ?? product.name;

    return {
      meta: [
        { title: `${product.name} — BA Medical Store` },
        { name: "description", content: description.slice(0, 160) },
        { property: "og:title", content: product.name },
        { property: "og:description", content: description.slice(0, 200) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `${window.location.origin}/product/${product.slug}` },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductPage() {
  const { product } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="container-page py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/catalogue">Catalogue</BreadcrumbLink>
            </BreadcrumbItem>
            {product.categorySlug ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/categories/${product.categorySlug}`}>
                    {product.category}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <article className="container-page grid gap-10 pb-16 lg:grid-cols-[minmax(0,1fr)_440px]">
        <ProductImageGallery images={product.images} alt={product.name} />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand ? <Badge variant="soft">{product.brand}</Badge> : null}
            <AvailabilityBadge status={product.availability} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
            {product.sku ? (
              <p className="mt-1 text-xs text-muted-foreground">Réf. {product.sku}</p>
            ) : null}
          </div>

          <PriceBlock price={product.price} size="xl" layout="col" />

          <MedicalBadges kinds={product.certifications ?? []} />

          {product.description ? (
            <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
          ) : null}

          <Separator />

          <WhatsAppOrderButton
            product={product}
            quantity={1}
            size="lg"
            width="full"
            label="Commander sur WhatsApp"
            aria-label={`Commander ${product.name} sur WhatsApp`}
          />

          <ul className="grid gap-2 rounded-lg border border-border bg-surface p-4 text-sm">
            <FeatureLine icon={ShieldCheck}>Commande confirmée directement avec notre équipe</FeatureLine>
            <FeatureLine icon={Truck}>Livraison partout en Tunisie</FeatureLine>
            {product.warrantyMonths ? (
              <FeatureLine icon={Award}>Garantie : {product.warrantyMonths} mois</FeatureLine>
            ) : null}
          </ul>

          {product.documents?.length ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Documents</h2>
              {product.documents.map((document) => (
                <a
                  key={document.url}
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  {document.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </SiteLayout>
  );
}

function FeatureLine({
  icon: Icon,
  children,
}: {
  icon: typeof ShieldCheck;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span>{children}</span>
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
