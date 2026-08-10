import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { Brand } from "@/types/product";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link to="/brands/$slug" params={{ slug: brand.slug }} className="block">
      <Card className="flex flex-col items-center justify-center gap-3 border-border/70 p-6 text-center transition-all hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]">
        <div className="grid h-16 w-full place-items-center rounded-md bg-surface-muted text-lg font-bold tracking-tight text-foreground">
          {brand.name}
        </div>
        <span className="text-xs text-muted-foreground">{brand.productCount ?? 0} produits</span>
      </Card>
    </Link>
  );
}
