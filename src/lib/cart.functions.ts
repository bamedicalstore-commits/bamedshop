import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getOrCreateCartId,
  normalizeQuantity,
  normalizeUuid,
  readCart,
  requireActiveProductPrice,
} from "./cart.server";

/** Panier de l'utilisateur authentifié (lecture). */
export const getMyCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readCart(context.supabase, context.userId));

/**
 * Ajoute un produit. Le prix unitaire vient TOUJOURS de la DB.
 * Ligne dupliquée : la contrainte UNIQUE (cart_id, product_id) impose un
 * comportement déterministe → incrément de la quantité existante.
 */
export const addCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { productId: string; quantity?: number }) => ({
    productId: normalizeUuid(input?.productId, "identifiant produit"),
    quantity: normalizeQuantity(input?.quantity ?? 1),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const price = await requireActiveProductPrice(supabase, data.productId);
    const cartId = await getOrCreateCartId(supabase, userId);

    const existing = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", data.productId)
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);

    if (existing.data) {
      const quantity = normalizeQuantity(existing.data.quantity + data.quantity);
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", existing.data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: data.productId,
        quantity: data.quantity,
        // Autorité serveur ; le trigger `enforce_cart_item_price` re-résout ce prix.
        unit_price: price,
      });
      if (error) throw new Error(error.message);
    }

    return readCart(supabase, userId);
  });

/** Met à jour la quantité d'une ligne. quantity <= 0 → suppression. */
export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { productId: string; quantity: number }) => ({
    productId: normalizeUuid(input?.productId, "identifiant produit"),
    quantity: Math.trunc(Number(input?.quantity)),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const cartId = await getOrCreateCartId(supabase, userId);

    if (!Number.isFinite(data.quantity) || data.quantity < 1) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)
        .eq("product_id", data.productId);
      if (error) throw new Error(error.message);
      return readCart(supabase, userId);
    }

    const quantity = normalizeQuantity(data.quantity);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_id", cartId)
      .eq("product_id", data.productId);
    if (error) throw new Error(error.message);
    return readCart(supabase, userId);
  });

/** Retire une ligne du panier. */
export const removeCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { productId: string }) => ({
    productId: normalizeUuid(input?.productId, "identifiant produit"),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const cartId = await getOrCreateCartId(supabase, userId);
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("product_id", data.productId);
    if (error) throw new Error(error.message);
    return readCart(supabase, userId);
  });

/** Vide le panier. */
export const clearMyCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const cartId = await getOrCreateCartId(supabase, userId);
    const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId);
    if (error) throw new Error(error.message);
    return readCart(supabase, userId);
  });
