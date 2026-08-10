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
import { CATEGORIES } from "@/constants/navigation";
import { listPublicProducts } from "@/lib/catalog.functions";
import { toProduct } from "@/lib/mappers";
import { PackageX } from "lucide-react";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { slug: cat.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Catégorie introuvable" }, { name: "robots", content: "noindex" }] };
    const cat = CATEGORIES.find((c) => c.slug === loaderData.slug)!;
    return {
      meta: [
        { title: `${cat.name} — BA Medical Store` },
        { name: "description", content: cat.description ?? `Découvrez notre sélection de ${cat.name.toLowerCase()}.` },
        { property: "og:title", content: `${cat.name} — BA Medical Store` },
        { property: "og:description", content: cat.description ?? "" },
      ],
    };
  },
  component: CategoryDetail,
  notFoundComponent: CategoryNotFound,
});

function CategoryDetail() {
  const { slug } = Route.useLoaderData();
  const category = CATEGORIES.find((c) => c.slug === slug)!;

  const fetchProducts = useServerFn(listPublicProducts);
  const { data, isPending, isError } = useQuery({
    queryKey: ["public-products", { limit: 100 }],
    queryFn: () => fetchProducts({ data: { limit: 100 } }),
  });

  const products = useMemo(
    () => (data?.products ?? []).map((row) => toProduct(row)).filter((p) => p.categorySlug === slug),
    [data, slug],
  );

  return (
    <SiteLayout>
      <div className="container-page py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/categories">Catégories</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{category.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container-page pb-14">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
          )}
        </header>

        {isPending ? (
          <ProductGridSkeleton count={4} />
        ) : isError || data?.error ? (
          <ErrorState description="Catalogue temporairement indisponible." />
        ) : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageX}
            title="Aucun produit dans cette catégorie"
            description="Notre catalogue s'étoffe chaque semaine — revenez bientôt."
            action={
              <Button asChild>
                <Link to="/catalogue">Voir tout le catalogue</Link>
              </Button>
            }
          />
        )}
      </div>
    </SiteLayout>
  );
}

function CategoryNotFound() {
  return (
    <SiteLayout>
      <div className="container-page py-20">
        <EmptyState
          icon={PackageX}
          title="Catégorie introuvable"
          description="Cette catégorie n'existe pas ou a été renommée."
          action={<Button asChild><Link to="/categories">Voir les catégories</Link></Button>}
        />
      </div>
    </SiteLayout>
  );
}
