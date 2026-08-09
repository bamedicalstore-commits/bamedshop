/**
 * Adapters DB ↔ Frontend
 * ----------------------
 * Convertit les rows PostgreSQL (types générés Supabase, source `schema.sql`)
 * vers les shapes utilisées par les composants Frontend existants (types
 * `src/types/product.ts`). Cette couche est le SEUL point de conversion :
 * les composants ne connaissent que les types Frontend, les Server Functions
 * (Sprint B2+) ne connaîtront que les rows DB.
 *
 * Convention prix : la base stocke `NUMERIC(12,3)` en TND (unité principale).
 * Le Frontend attend des minor units (millimes) → conversion ×1000.
 */
import type { Tables } from "@/integrations/supabase/types";
import type { Availability, Brand, Category, Money, Product } from "@/types/product";

// ────────────────────────────────────────────────────────────────────────────
// Money — DB (NUMERIC TND unité) → Frontend (minor units millimes)
// ────────────────────────────────────────────────────────────────────────────
export function toMoney(
  amount: number | string | null | undefined,
  currency: string | null | undefined = "TND",
): Money {
  const n = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  return {
    amount: Math.round(n * 1000),
    currency: (currency ?? "TND") as Money["currency"],
  };
}

export function fromMoney(m: Money): number {
  return m.amount / 1000;
}

// ────────────────────────────────────────────────────────────────────────────
// Availability : la DB actuelle n'expose AUCUN stock live. `active` traduit
// uniquement la visibilité catalogue. On mappe donc vers un statut catalogue
// honnête (`available` / `unavailable`) et non vers un statut de stock.
// ────────────────────────────────────────────────────────────────────────────
export function toAvailability(active: boolean | null): Availability {
  return active === false ? "unavailable" : "available";
}

// ────────────────────────────────────────────────────────────────────────────
// Produit
// Le row DB seul ne contient ni brand.name ni category.name — l'adapter
// accepte donc des joints résolus (brands + categories) optionnels.
// ────────────────────────────────────────────────────────────────────────────
export type ProductRow = Tables<"products">;
export type ProductMediaRow = Tables<"product_media">;
export type ProductDocumentRow = Tables<"product_documents">;

export type ProductJoined = ProductRow & {
  brand?: Pick<Tables<"brands">, "name" | "slug"> | null;
  category?: Pick<Tables<"categories">, "name" | "slug"> | null;
  media?: Pick<ProductMediaRow, "url" | "position">[];
  documents?: Pick<ProductDocumentRow, "label" | "url">[];
};

export function toProduct(row: ProductJoined): Product {
  const images = (row.media ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((m) => m.url);

  const specs = (row.technical_specs ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    brand: row.brand?.name ?? "",
    brandSlug: row.brand?.slug ?? "",
    category: row.category?.name ?? "",
    categorySlug: row.category?.slug ?? "",
    description: row.description ?? undefined,
    images,
    price: toMoney(row.price, row.currency),
    // professional_price n'est PAS un ancien prix : aucun compareAtPrice dérivé.
    professionalPrice: row.professional_price
      ? toMoney(row.professional_price, row.currency)
      : undefined,
    availability: toAvailability(row.active),
    warrantyMonths: row.warranty_months ?? undefined,
    attributes: Object.fromEntries(Object.entries(specs).map(([k, v]) => [k, String(v)])),
    documents: row.documents?.map((d) => ({ label: d.label, url: d.url })),
    certifications: row.ce_certified ? ["ce"] : undefined,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Catégorie
// ────────────────────────────────────────────────────────────────────────────
export function toCategory(row: Tables<"categories">, productCount?: number): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image_url ?? undefined,
    productCount,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Marque
// ────────────────────────────────────────────────────────────────────────────
export function toBrand(row: Tables<"brands">, productCount?: number): Brand {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo: row.logo_url ?? undefined,
    productCount,
  };
}
