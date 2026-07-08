import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { MOCK_PRODUCTS } from "@/constants/navigation";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Rechercher — BA Medical Store" },
      { name: "description", content: "Recherchez parmi tout notre catalogue de matériel médical." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const results = q
    ? MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    : [];
  return (
    <SiteLayout>
      <div className="container-page py-10">
        <h1 className="text-3xl font-bold tracking-tight">Rechercher</h1>
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="mt-6 flex max-w-2xl gap-2"
        >
          <label htmlFor="q" className="sr-only">Terme de recherche</label>
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tapez un produit, une marque, une référence…"
              className="h-12 pl-10"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg">Rechercher</Button>
        </form>

        <div className="mt-10">
          {q === "" ? (
            <EmptyState
              icon={SearchIcon}
              title="Que cherchez-vous ?"
              description="Saisissez un mot-clé pour lancer la recherche dans le catalogue."
            />
          ) : results.length ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {results.length} résultat{results.length > 1 ? "s" : ""} pour « {q} »
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((p) => (<ProductCard key={p.id} product={p} />))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={SearchIcon}
              title={`Aucun résultat pour « ${q} »`}
              description="Essayez avec un autre mot-clé, ou parcourez nos catégories."
            />
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
