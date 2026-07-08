import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CATEGORIES, BRANDS, MOCK_PRODUCTS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue matériel médical — BA Medical Store" },
      { name: "description", content: "Parcourez notre catalogue complet de matériel médical : diagnostic, consommables, mobilier, orthopédie, premiers secours." },
      { property: "og:title", content: "Catalogue matériel médical" },
      { property: "og:description", content: "Notre gamme complète de matériel médical certifié." },
    ],
  }),
  component: CataloguePage,
});

function CataloguePage() {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [price, setPrice] = useState<number[]>([0, 2000]);

  return (
    <SiteLayout>
      <div className="container-page py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Accueil</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Catalogue</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container-page pb-14">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Catalogue</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {MOCK_PRODUCTS.length} produits · Catalogue Pharmatec Tunisie
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal /> Filtres
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <Filters price={price} setPrice={setPrice} />
              </SheetContent>
            </Sheet>
            <Select defaultValue="pop">
              <SelectTrigger className="h-9 w-[180px]" aria-label="Trier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pop">Popularité</SelectItem>
                <SelectItem value="new">Nouveautés</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="rating">Meilleures notes</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden rounded-md border border-input p-0.5 sm:flex">
              <Button
                variant={layout === "grid" ? "soft" : "ghost"}
                size="icon-sm"
                onClick={() => setLayout("grid")}
                aria-label="Vue grille"
                aria-pressed={layout === "grid"}
              >
                <LayoutGrid />
              </Button>
              <Button
                variant={layout === "list" ? "soft" : "ghost"}
                size="icon-sm"
                onClick={() => setLayout("list")}
                aria-label="Vue liste"
                aria-pressed={layout === "list"}
              >
                <List />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <Filters price={price} setPrice={setPrice} />
          </aside>
          <div
            className={cn(
              "grid gap-5",
              layout === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
            )}
          >
            {MOCK_PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} layout={layout} />
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Filters({ price, setPrice }: { price: number[]; setPrice: (v: number[]) => void }) {
  return (
    <div className="space-y-6 py-4">
      <FilterGroup title="Catégories">
        {CATEGORIES.slice(0, 6).map((c) => (
          <label key={c.slug} className="flex items-center gap-2 py-1 text-sm">
            <Checkbox id={`cat-${c.slug}`} />
            <span className="flex-1 text-foreground">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.productCount}</span>
          </label>
        ))}
      </FilterGroup>
      <Separator />
      <FilterGroup title="Marques">
        {BRANDS.slice(0, 6).map((b) => (
          <label key={b.slug} className="flex items-center gap-2 py-1 text-sm">
            <Checkbox id={`b-${b.slug}`} />
            <span className="flex-1 text-foreground">{b.name}</span>
            <span className="text-xs text-muted-foreground">{b.productCount}</span>
          </label>
        ))}
      </FilterGroup>
      <Separator />
      <FilterGroup title="Prix (DT)">
        <div className="px-1 pt-2">
          <Slider value={price} onValueChange={setPrice} min={0} max={2000} step={10} />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{price[0]} DT</span>
            <span>{price[1]} DT</span>
          </div>
        </div>
      </FilterGroup>
      <Separator />
      <FilterGroup title="Disponibilité">
        <label className="flex items-center gap-2 py-1 text-sm">
          <Checkbox id="in-stock" defaultChecked /> <span>En stock uniquement</span>
        </label>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </Label>
      <div>{children}</div>
    </div>
  );
}
