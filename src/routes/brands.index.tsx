import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BrandCard } from "@/components/ecommerce/BrandCard";
import { BRANDS } from "@/constants/navigation";

export const Route = createFileRoute("/brands/")({
  head: () => ({
    meta: [
      { title: "Nos marques — BA Medical Store" },
      { name: "description", content: "Découvrez toutes les marques référentes de matériel médical distribuées par BA Medical Store." },
      { property: "og:title", content: "Nos marques" },
      { property: "og:description", content: "Marques référentes de matériel médical." },
    ],
  }),
  component: BrandsIndex,
});

function BrandsIndex() {
  return (
    <SiteLayout>
      <div className="container-page py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Nos marques</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Sélection rigoureuse de marques référentes pour votre exercice quotidien.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {BRANDS.map((b) => (
            <BrandCard key={b.slug} brand={b} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
