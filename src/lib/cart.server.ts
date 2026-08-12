/**
 * Helpers serveur du panier client.
 * Utilise EXCLUSIVEMENT le client Supabase authentifié (RLS as user).
 * Aucun client service-role ici.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { PRODUCT_COLUMNS } from "./product-select";
import type { ProductJoined } from "./mappers";

export type AuthedClient = SupabaseClient<Database>;

export const MAX_QUANTITY = 99;

/** Quantité entière strictement positive et bornée. FAIT : CHECK (quantity > 0) en DB. */
export function normalizeQuantity(value: unknown): number {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 1) throw new Error("Quantité invalide");
  return Math.min(n, MAX_QUANTITY);
}

export function normalizeUuid(value: unknown, label = "identifiant"): string {
  const s = String(value ?? "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
    throw new Error(`Format d'${label} invalide`);
  }
  return s;
}

/** Panier courant de l'utilisateur, créé si absent (carts.user_id est UNIQUE). */
export async function getOrCreateCartId(supabase: AuthedClient, userId: string): Promise<string> {
  const existing = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data.id;

  const created = await supabase
    .from("carts")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("id")
    .single();
  if (created.error) throw new Error(created.error.message);
  return created.data.id;
}

export type CartLineDTO = {
  id: string;
  productId: string;
  quantity: number;
  /** Prix unitaire TND tel que persisté en DB (autorité serveur). */
  unitPrice: number;
  product: ProductJoined;
};

export type CartDTO = {
  cartId: string | null;
  lines: CartLineDTO[];
};

export async function readCart(supabase: AuthedClient, userId: string): Promise<CartDTO> {
  const cart = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (cart.error) throw new Error(cart.error.message);
  if (!cart.data) return { cartId: null, lines: [] };

  const items = await supabase
    .from("cart_items")
    .select(
      `id, product_id, quantity, unit_price, created_at, product:products ( ${PRODUCT_COLUMNS} )`,
    )
    .eq("cart_id", cart.data.id)
    .order("created_at", { ascending: true });
  if (items.error) throw new Error(items.error.message);

  return {
    cartId: cart.data.id,
    lines: (items.data ?? [])
      .filter((row) => row.product !== null)
      .map((row) => ({
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        unitPrice: Number(row.unit_price),
        product: row.product as unknown as ProductJoined,
      })),
  };
}

/** Vérifie l'existence ET l'activité du produit, puis renvoie son prix DB. */
export async function requireActiveProductPrice(
  supabase: AuthedClient,
  productId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("products")
    .select("id, price, active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Produit indisponible");
  return Number(data.price);
}
