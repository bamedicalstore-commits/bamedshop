import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CategoryCard } from "@/components/ecommerce/CategoryCard";
import { CATEGORIES } from "@/constants/navigation";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Toutes les catégories — BA Medical Store" },
      { name: "description", content: "Explorez toutes nos catégories : diagnostic, consommables, mobilier, orthopédie, hygiène, laboratoire." },
      { property: "og:title", content: "Toutes les catégories" },
      { property: "og:description", content: "Notre matériel médical, organisé par catégorie." },
    ],
  }),
  component: CategoriesIndex,
});

function CategoriesIndex() {
  return (
    <SiteLayout>
      <div className="container-page py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Toutes les catégories</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Notre matériel médical, organisé pour vous permettre de trouver rapidement ce dont
            vous avez besoin.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
