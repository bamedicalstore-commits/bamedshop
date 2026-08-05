import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal, LayoutGrid, List, X, Package } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProductGridSkeleton } from "@/components/feedback/Skeletons";
import { listPublicProducts } from "@/lib/catalog.functions";
import { toProduct } from "@/lib/mappers";
import { CATEGORIES, BRANDS } from "@/constants/navigation";
import type { Product } from "@/types/product";
import type { MedicalBadgeKind } from "@/components/ecommerce/MedicalBadges";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue matériel médical — BA Medical Store" },
      { name: "description", content: "Parcourez notre catalogue complet de matériel médical : diagnostic, consommables, mobilier, orthopédie, premiers secours. Filtres : catégorie, marque, prix, marquage CE, garantie." },
      { property: "og:title", content: "Catalogue matériel médical" },
      { property: "og:description", content: "Notre gamme complète de matériel médical certifié." },
    ],
  }),
  component: CataloguePage,
});

interface Filters {
  categories: string[];
  brands: string[];
  price: [number, number];
  certifications: MedicalBadgeKind[];
  warrantyMinMonths: number;
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  brands: [],
  price: [0, 2000],
  certifications: [],
  warrantyMinMonths: 0,
};

/** Seule certification réellement alimentée par la DB : products.ce_certified. */
const CERT_OPTIONS: { value: MedicalBadgeKind; label: string }[] = [
  { value: "ce", label: "Marquage CE" },
];

function CataloguePage() {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<string>("pop");

  const fetchProducts = useServerFn(listPublicProducts);
  const { data, isPending, isError } = useQuery({
    queryKey: ["public-products", { limit: 100 }],
    queryFn: () => fetchProducts({ data: { limit: 100 } }),
  });

  const products = useMemo(
    () =>
      (data?.products ?? []).map((row) =>
        toProduct(row),
      ),
    [data],
  );

  const filtered = useMemo(() => applyFilters(products, filters, sort), [products, filters, sort]);
  const activeCount = countActive(filters);

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
              {filtered.length} produits · Catalogue Pharmatec Tunisie
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal /> Filtres
                  {activeCount > 0 && <Badge variant="soft">{activeCount}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <FiltersPanel filters={filters} setFilters={setFilters} />
              </SheetContent>
            </Sheet>
            <Select value={sort} onValueChange={setSort}>
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

        {activeCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filtres actifs
            </span>
            <ActiveChips filters={filters} setFilters={setFilters} />
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              <X aria-hidden="true" /> Tout effacer
            </Button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <FiltersPanel filters={filters} setFilters={setFilters} />
          </aside>
          {isPending ? (
            <ProductGridSkeleton count={6} />
          ) : isError || data?.error ? (
            <ErrorState description="Catalogue temporairement indisponible." />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Aucun produit disponible"
              description="Le catalogue sera bientôt enrichi. Revenez très prochainement."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Aucun produit ne correspond à vos filtres"
              description="Essayez d'élargir votre recherche ou de réinitialiser les filtres."
              action={
                <Button onClick={() => setFilters(DEFAULT_FILTERS)}>Réinitialiser les filtres</Button>
              }
            />
          ) : (
            <div
              className={cn(
                "grid animate-fade-in gap-5",
                layout === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
              )}
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} layout={layout} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function FiltersPanel({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters({ ...filters, [key]: value });

  const toggleArr = <T extends string>(key: "categories" | "brands" | "certifications", value: T) => {
    const arr = filters[key] as unknown as T[];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    setFilters({ ...filters, [key]: next as Filters[typeof key] });
  };

  return (
    <div className="space-y-6 py-4">
      <FilterGroup title="Catégories">
        {CATEGORIES.map((c) => (
          <label key={c.slug} className="flex items-center gap-2 py-1 text-sm">
            <Checkbox
              id={`cat-${c.slug}`}
              checked={filters.categories.includes(c.slug)}
              onCheckedChange={() => toggleArr("categories", c.slug)}
            />
            <span className="flex-1 text-foreground">{c.name}</span>
            <span className="text-xs text-muted-foreground">{c.productCount}</span>
          </label>
        ))}
      </FilterGroup>
      <Separator />
      <FilterGroup title="Marques">
        {BRANDS.map((b) => (
          <label key={b.slug} className="flex items-center gap-2 py-1 text-sm">
            <Checkbox
              id={`b-${b.slug}`}
              checked={filters.brands.includes(b.slug)}
              onCheckedChange={() => toggleArr("brands", b.slug)}
            />
            <span className="flex-1 text-foreground">{b.name}</span>
            <span className="text-xs text-muted-foreground">{b.productCount}</span>
          </label>
        ))}
      </FilterGroup>
      <Separator />
      <FilterGroup title="Prix (DT)">
        <div className="px-1 pt-2">
          <Slider
            value={filters.price}
            onValueChange={(v) => set("price", [v[0], v[1]] as [number, number])}
            min={0}
            max={2000}
            step={10}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{filters.price[0]} DT</span>
            <span>{filters.price[1]} DT</span>
          </div>
        </div>
      </FilterGroup>
      <Separator />
      <FilterGroup title="Certifications">
        {CERT_OPTIONS.map((c) => (
          <label key={c.value} className="flex items-center gap-2 py-1 text-sm">
            <Checkbox
              id={`cert-${c.value}`}
              checked={filters.certifications.includes(c.value)}
              onCheckedChange={() => toggleArr("certifications", c.value)}
            />
            <span className="flex-1">{c.label}</span>
          </label>
        ))}
      </FilterGroup>
      <Separator />
      <FilterGroup title="Garantie minimum">
        <div className="px-1 pt-2">
          <Slider
            value={[filters.warrantyMinMonths]}
            onValueChange={(v) => set("warrantyMinMonths", v[0])}
            min={0}
            max={36}
            step={6}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Aucune</span>
            <span>{filters.warrantyMinMonths} mois</span>
          </div>
        </div>
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

function ActiveChips({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const chips: { label: string; remove: () => void }[] = [];
  filters.categories.forEach((slug) => {
    const c = CATEGORIES.find((c) => c.slug === slug);
    if (!c) return;
    chips.push({
      label: c.name,
      remove: () => setFilters({ ...filters, categories: filters.categories.filter((s) => s !== slug) }),
    });
  });
  filters.brands.forEach((slug) => {
    const b = BRANDS.find((b) => b.slug === slug);
    if (!b) return;
    chips.push({
      label: b.name,
      remove: () => setFilters({ ...filters, brands: filters.brands.filter((s) => s !== slug) }),
    });
  });
  filters.certifications.forEach((c) => {
    chips.push({
      label: c,
      remove: () => setFilters({ ...filters, certifications: filters.certifications.filter((v) => v !== c) }),
    });
  });
  if (filters.warrantyMinMonths > 0) {
    chips.push({
      label: `Garantie ≥ ${filters.warrantyMinMonths}m`,
      remove: () => setFilters({ ...filters, warrantyMinMonths: 0 }),
    });
  }
  return (
    <>
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.remove}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:border-primary hover:text-primary"
        >
          {c.label}
          <X className="size-3" aria-hidden="true" />
        </button>
      ))}
    </>
  );
}

function countActive(f: Filters): number {
  let n = 0;
  n += f.categories.length + f.brands.length + f.certifications.length;
  if (f.warrantyMinMonths > 0) n++;
  return n;
}

function applyFilters(products: Product[], f: Filters, sort: string): Product[] {
  const [minP, maxP] = f.price;
  const minPMinor = minP * 1000;
  const maxPMinor = maxP * 1000;

  const filtered = products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.categorySlug)) return false;
    if (f.brands.length && !f.brands.includes(p.brandSlug)) return false;
    if (p.price.amount < minPMinor || p.price.amount > maxPMinor) return false;
    if (f.certifications.length) {
      const certs = p.certifications ?? [];
      if (!f.certifications.every((c) => certs.includes(c))) return false;
    }
    if (f.warrantyMinMonths > 0 && (p.warrantyMonths ?? 0) < f.warrantyMinMonths) return false;
    return true;
  });

  return sortProducts(filtered, sort);
}

function sortProducts(list: Product[], sort: string): Product[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return arr.sort((a, b) => b.price.amount - a.price.amount);
    case "rating":
      return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "new":
      return arr.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    default:
      return arr.sort(
        (a, b) => Number(!!b.isBestSeller) - Number(!!a.isBestSeller) || (b.rating ?? 0) - (a.rating ?? 0),
      );
  }
}
