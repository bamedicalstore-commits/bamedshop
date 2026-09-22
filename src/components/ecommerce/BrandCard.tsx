import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/types/product";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link to="/brands/$slug" params={{ slug: brand.slug }} className="group block h-full">
      <Card className="flex h-full min-h-28 flex-col justify-between gap-4 border-border/80 bg-card p-4 shadow-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-soft)] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[15px] font-semibold tracking-[-0.015em] text-foreground">
            {brand.name}
          </span>
          <ArrowUpRight
            className="size-3.5 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {brand.productCount ?? 0} produits
        </span>
      </Card>
    </Link>
  );
}
