import { supabase } from "@/integrations/supabase/client";

export type CatalogActivationStatus = "DRAFT" | "REVIEW" | "APPROVED" | "ACTIVE" | "BLOCKED";
export type CatalogActivationReason =
  | "ready"
  | "missing_retail_price"
  | "retail_price_not_approved"
  | "media_not_approved"
  | "copy_not_approved"
  | "missing_slug"
  | "archived";

export type CatalogActivationProduct = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  retail_price_tnd: number | null;
  retail_price_approved: boolean;
  media_approved: boolean;
  copy_approved: boolean;
  catalog_activation_status: CatalogActivationStatus;
  catalog_activation_reason: CatalogActivationReason | null;
  retail_activated_at: string | null;
};

type ActivationRpcResult = {
  product_id: string;
  status: CatalogActivationStatus;
  reason: CatalogActivationReason;
};

type SupabaseRpcClient = {
  rpc: (
    functionName: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: ActivationRpcResult[] | null; error: { message: string } | null }>;
};

const rpcClient = supabase as unknown as SupabaseRpcClient;

export async function listCatalogActivationQueue(): Promise<CatalogActivationProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,active,retail_price_tnd,retail_price_approved,media_approved,copy_approved,catalog_activation_status,catalog_activation_reason,retail_activated_at",
    )
    .order("retail_updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as CatalogActivationProduct[];
}

export async function activateCatalogProduct(productId: string): Promise<ActivationRpcResult> {
  const { data, error } = await rpcClient.rpc("activate_catalog_product", {
    p_product_id: productId,
  });

  if (error) throw error;
  const result = data?.[0];
  if (!result) throw new Error("Activation RPC returned no decision");
  return result;
}

export async function deactivateCatalogProduct(
  productId: string,
  reason: CatalogActivationReason = "archived",
): Promise<ActivationRpcResult> {
  const { data, error } = await rpcClient.rpc("deactivate_catalog_product", {
    p_product_id: productId,
    p_reason: reason,
  });

  if (error) throw error;
  const result = data?.[0];
  if (!result) throw new Error("Deactivation RPC returned no decision");
  return result;
}
