import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, FileText, Award, ListChecks } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Product } from "@/types/product";

interface ProductTabsProps {
  product: Product;
  /** Optional custom slots to override tab content when backend is wired. */
  slots?: {
    description?: ReactNode;
    specs?: ReactNode;
    documents?: ReactNode;
    reviews?: ReactNode;
  };
}

export function ProductTabs({ product, slots }: ProductTabsProps) {
  return (
    <Tabs defaultValue="desc" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
        <TabsTrigger value="desc"><Info aria-hidden="true" /> Description</TabsTrigger>
        <TabsTrigger value="specs"><ListChecks aria-hidden="true" /> Caractéristiques</TabsTrigger>
        <TabsTrigger value="docs"><FileText aria-hidden="true" /> Documents</TabsTrigger>
        <TabsTrigger value="reviews"><Award aria-hidden="true" /> Avis</TabsTrigger>
      </TabsList>

      <TabsContent value="desc" className="prose prose-sm max-w-none py-6">
        {slots?.description ?? (
          <p className="text-muted-foreground">
            {product.description ??
              `${product.name} — un équipement fiable, conçu pour un usage professionnel intensif. Description détaillée à compléter au branchement du catalogue.`}
          </p>
        )}
      </TabsContent>

      <TabsContent value="specs" className="py-6">
        {slots?.specs ?? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <SpecRow label="Marque" value={product.brand} />
            <SpecRow label="Catégorie" value={product.category} />
            <SpecRow label="Référence" value={product.reference ?? "—"} />
            <SpecRow label="SKU" value={product.sku ?? "—"} />
            {product.attributes &&
              Object.entries(product.attributes).map(([k, v]) => (
                <SpecRow key={k} label={k} value={v} />
              ))}
          </dl>
        )}
      </TabsContent>

      <TabsContent value="docs" className="py-6">
        {slots?.documents ?? (
          <EmptyState
            icon={FileText}
            title="Aucun document"
            description="Les fiches techniques et notices seront disponibles prochainement."
          />
        )}
      </TabsContent>

      <TabsContent value="reviews" className="py-6">
        {slots?.reviews ?? (
          <EmptyState
            icon={Award}
            title="Aucun avis pour le moment"
            description="Soyez le premier à évaluer ce produit."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
