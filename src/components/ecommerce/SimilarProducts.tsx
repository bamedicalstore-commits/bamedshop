import { SectionHeader } from "@/components/common/SectionHeader";
import { ProductCard } from "./ProductCard";
import { similarProducts } from "@/lib/recommendations";
import { MOCK_PRODUCTS } from "@/constants/navigation";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
  title?: string;
  eyebrow?: string;
  limit?: number;
  pool?: Product[];
}

export function SimilarProducts({
  product,
  className,
  title = "Produits similaires",
  eyebrow = "Recommandé",
  limit = 4,
  pool = MOCK_PRODUCTS,
}: Props) {
  const items = similarProducts(product, pool, limit);
  if (items.length === 0) return null;
  return (
    <section className={cn(className)} aria-labelledby="similar-heading">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <h3 id="similar-heading" className="sr-only">
        {title}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
