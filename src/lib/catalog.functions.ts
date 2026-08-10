import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const PRODUCT_COLUMNS =
  "id, slug, name, short_description, description, price, compare_at_price, currency, stock, active, featured, brand_id, category_id, image_url, images, sku, created_at, updated_at";

function createPublicClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase public environment is not configured");

  return createClient(url, key, {
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
      return { product: null, error: "Produit temporairement indisponible" as string | null };
    }
    return { product: row ?? null, error: null as string | null };
  });
