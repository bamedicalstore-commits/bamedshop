import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Public catalogue read path (read-only).
 * Uses the publishable key + the existing `products_public_read_active`
 * RLS policy (anon, active products only). No writes, no admin client.
 */
const PRODUCT_COLUMNS = `
  id, name, slug, description, sku, category_id, brand_id, supplier_id,
  price, professional_price, currency, ce_certified, warranty_months,
  technical_specs, active, created_at, updated_at,
  brand:brands ( name, slug ),
  category:categories ( name, slug ),
  media:product_media ( url, position ),
  documents:product_documents ( label, url )
` as const;

function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const listPublicProducts = createServerFn({ method: "GET" })
  .validator((input?: { limit?: number; offset?: number }) => ({
    limit: Math.min(Math.max(input?.limit ?? 24, 1), 100),
    offset: Math.max(input?.offset ?? 0, 0),
  }))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      console.error("listPublicProducts failed:", error.message);
      return { products: [], error: "Catalogue temporairement indisponible" as string | null };
    }
    return { products: rows ?? [], error: null as string | null };
  });

export const getPublicProductBySlug = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => {
    const slug = String(input?.slug ?? "").trim();
    if (!slug || slug.length > 200) throw new Error("Invalid slug");
    return { slug };
  })
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) {
      console.error("getPublicProductBySlug failed:", error.message);
      return { product: null, error: "Catalogue temporairement indisponible" as string | null };
    }
    return { product: row ?? null, error: null as string | null };
  });
