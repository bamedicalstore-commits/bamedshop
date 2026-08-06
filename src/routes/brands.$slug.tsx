import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProductGridSkeleton } from "@/components/feedback/Skeletons";
import { Button } from "@/components/ui/button";
import { BRANDS } from "@/constants/navigation";
import { listPublicProducts } from "@/lib/catalog.functions";
import { toProduct } from "@/lib/mappers";
import { PackageX } from "lucide-react";

export const Route = createFileRoute("/brands/$slug")({
  loader: ({ params }) => {
    const b = BRANDS.find((x) => x.slug === params.slug);
    if (!b) throw notFound();
    return { slug: b.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Marque introuvable" }, { name: "robots", content: "noindex" }] };
    const b = BRANDS.find((x) => x.slug === loaderData.slug)!;
    return {
      meta: [
        { title: `${b.name} — BA Medical Store` },
        { name: "description", content: `Découvrez tous les produits ${b.name} disponibles chez BA Medical Store.` },
        { property: "og:title", content: `${b.name} — BA Medical Store` },
        { property: "og:description", content: `Les produits ${b.name} du catalogue BA Medical Store.` },
      ],
    };
  },
  component: BrandDetail,
  notFoundComponent: BrandNotFound,
});

function BrandDetail() {
  const { slug } = Route.useLoaderData();
  const brand = BRANDS.find((b) => b.slug === slug)!;

  const fetchProducts = useServerFn(listPublicProducts);
  const { data, isPending, isError } = useQuery({
    queryKey: ["public-products", { limit: 100 }],
    queryFn: () => fetchProducts({ data: { limit: 100 } }),
  });

  const products = useMemo(
    () => (data?.products ?? []).map((row) => toProduct(row)).filter((p) => p.brandSlug === slug),
    [data, slug],
  );

  return (
    <SiteLayout>
      <div className="container-page py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/brands">Marques</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{brand.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="container-page pb-14">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{brand.name}</h1>
          {!isPending && !isError && !data?.error && (
            <p className="mt-2 text-muted-foreground">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </p>
          )}
        </header>
        {isPending ? (
          <ProductGridSkeleton count={4} />
        ) : isError || data?.error ? (
          <ErrorState description="Catalogue temporairement indisponible." />
        ) : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        ) : (
          <EmptyState
            icon={PackageX}
            title="Aucun produit pour cette marque"
            action={<Button asChild><Link to="/catalogue">Voir le catalogue</Link></Button>}
          />
        )}
      </div>
    </SiteLayout>
  );
}

function BrandNotFound() {
  return (
    <SiteLayout>
      <div className="container-page py-20">
        <EmptyState icon={PackageX} title="Marque introuvable" />
      </div>
    </SiteLayout>
  );
}
