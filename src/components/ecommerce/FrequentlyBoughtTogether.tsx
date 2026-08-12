import { useMemo, useState } from "react";
import { Plus, ShoppingCart, Pill } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionHeader } from "@/components/common/SectionHeader";
import { PriceBlock } from "./PriceBlock";
import { toast } from "sonner";
import { uiActions } from "@/hooks/useUiStore";
import { frequentlyBoughtTogether, bundleTotalMinor } from "@/lib/recommendations";
import { MOCK_PRODUCTS } from "@/constants/navigation";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
  /** Restrict candidate pool — defaults to full MOCK_PRODUCTS. */
  pool?: Product[];
}

export function FrequentlyBoughtTogether({ product, className, pool = MOCK_PRODUCTS }: Props) {
  const suggestions = useMemo(() => frequentlyBoughtTogether(product, pool, 3), [product, pool]);
  const items = useMemo(() => [product, ...suggestions], [product, suggestions]);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((p) => [p.id, true])),
  );

  if (suggestions.length === 0) return null;

  const chosen = items.filter((p) => selected[p.id]);
  const total = bundleTotalMinor(chosen);

  const addBundle = () => {
    if (chosen.length === 0) return;
    chosen.forEach((p) => addToCart(p, 1, { silent: true }));
    toast.success(`Bundle ajouté (${chosen.length} produits)`, {
      description: "Retrouvez-les dans votre panier.",
    });
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]",
        className,
      )}
      aria-labelledby="fbt-heading"
    >
      <SectionHeader
        eyebrow="Recommandé"
        title="Souvent achetés ensemble"
        description="Complétez votre équipement — nos clients achètent souvent ces produits ensemble."
        className="mb-6"
      />
      <h3 id="fbt-heading" className="sr-only">
        Suggestions bundle
      </h3>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-wrap items-stretch gap-3">
          {items.map((p, idx) => (
            <div key={p.id} className="flex items-stretch gap-3">
              <label className="group relative flex w-40 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-[var(--shadow-soft)]">
                <span className="absolute left-2 top-2 z-10">
                  <Checkbox
                    checked={!!selected[p.id]}
                    onCheckedChange={(v) => setSelected((s) => ({ ...s, [p.id]: !!v }))}
                    aria-label={`Inclure ${p.name}`}
                  />
                </span>
                <div className="flex aspect-square items-center justify-center bg-surface-muted text-muted-foreground/40">
                  <Pill className="size-10" aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="line-clamp-2 text-xs font-semibold hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-auto">
                    <PriceBlock price={p.price} compareAtPrice={p.compareAtPrice} size="sm" />
                  </div>
                </div>
              </label>
              {idx < items.length - 1 && (
                <div className="flex items-center text-muted-foreground" aria-hidden="true">
                  <Plus className="size-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <aside className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total bundle</p>
            <p className="mt-1 text-2xl font-bold">
              {(total / 1000).toFixed(3)} <span className="text-sm font-semibold">DT</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {chosen.length} produit{chosen.length > 1 ? "s" : ""} sélectionné
              {chosen.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={addBundle} disabled={chosen.length === 0} size="lg">
            <ShoppingCart aria-hidden="true" /> Ajouter le bundle
          </Button>
        </aside>
      </div>
    </section>
  );
}
