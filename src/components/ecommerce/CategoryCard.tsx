import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Stethoscope } from "lucide-react";
import type { Category } from "@/types/product";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to="/categories/$slug" params={{ slug: category.slug }} className="group block h-full">
      <Card className="flex h-full min-h-40 flex-col justify-between gap-6 border-border/80 bg-card p-5 shadow-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-elevated)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Stethoscope className="size-[18px]" aria-hidden="true" />
          </span>
          <ArrowUpRight
            className="size-4 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            {category.name}
          </h3>
          {category.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {category.description}
            </p>
          ) : null}
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {category.productCount ?? 0} produits
          </p>
        </div>
      </Card>
    </Link>
  );
}
