import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ArrowRight, Stethoscope } from "lucide-react";
import type { Category } from "@/types/product";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to="/categories/$slug" params={{ slug: category.slug }} className="group block">
      <Card className="flex h-full flex-col gap-4 border-border/70 p-6 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Stethoscope className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
          {category.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{category.productCount ?? 0} produits</span>
          <span className="inline-flex items-center gap-1 font-medium text-primary transition-transform group-hover:translate-x-0.5">
            Voir <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
