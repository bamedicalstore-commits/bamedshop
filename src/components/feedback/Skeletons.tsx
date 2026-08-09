/**
 * Skeletons dédiés — un par page/critique pattern.
 * Utilisation : rendre pendant les chargements côté client
 * (Suspense boundaries, transitions de route, revalidation SWR).
 * Aucune dépendance externe — utilise animate-pulse + tokens.
 */
import { cn } from "@/lib/utils";

function Bar({ className }: { className?: string }) {
  return <div className={cn("h-3 animate-pulse rounded-full bg-muted", className)} />;
}

function Block({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function ProductCardSkeleton({ layout = "grid" }: { layout?: "grid" | "list" }) {
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-xl border border-border/70 bg-card p-0",
        layout === "grid" ? "flex-col" : "flex-row",
      )}
      aria-hidden="true"
    >
      <Block className={cn(layout === "grid" ? "aspect-square w-full" : "aspect-square w-40 sm:w-48", "rounded-none")} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Bar className="w-1/3" />
        <Bar className="h-4 w-4/5" />
        <Bar className="w-1/2" />
        <div className="mt-auto flex items-center justify-between gap-3">
          <Bar className="h-5 w-20" />
          <Block className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, layout = "grid" }: { count?: number; layout?: "grid" | "list" }) {
  return (
    <div
      className={cn(
        "grid gap-5",
        layout === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} layout={layout} />
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Block key={i} className="h-28" />
      ))}
    </div>
  );
}

export function BrandsRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <Block key={i} className="h-20" />
      ))}
    </div>
  );
}

export function HomeHeroSkeleton() {
  return (
    <section className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20" aria-hidden="true">
      <div className="space-y-5">
        <Block className="h-6 w-40" />
        <Bar className="h-10 w-full" />
        <Bar className="h-10 w-4/5" />
        <Bar className="h-4 w-3/4" />
        <Block className="h-12 w-full max-w-md" />
        <div className="flex gap-3">
          <Block className="h-11 w-44" />
          <Block className="h-11 w-44" />
        </div>
      </div>
      <Block className="hidden aspect-[4/5] w-full rounded-3xl lg:block" />
    </section>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_440px]" aria-hidden="true">
      <div className="space-y-3">
        <Block className="aspect-square w-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block key={i} className="aspect-square" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Bar className="w-1/3" />
        <Bar className="h-8 w-full" />
        <Bar className="h-8 w-4/5" />
        <Bar className="h-5 w-32" />
        <Block className="h-10 w-40" />
        <Bar className="w-2/3" />
        <div className="flex gap-2">
          <Block className="h-11 w-32" />
          <Block className="h-11 flex-1" />
        </div>
        <Block className="h-32 w-full" />
      </div>
    </div>
  );
}

export function CatalogueSkeleton() {
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <div className="hidden space-y-5 lg:block">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bar className="w-24" />
            {Array.from({ length: 4 }).map((__, j) => (
              <Bar key={j} className="w-full" />
            ))}
          </div>
        ))}
      </div>
      <ProductGridSkeleton count={9} />
    </div>
  );
}

export function RecommendationsSkeleton({ count = 4 }: { count?: number }) {
  return <ProductGridSkeleton count={count} />;
}
