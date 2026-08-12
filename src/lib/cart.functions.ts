import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const CART_SELECT = `
  id,
  user_id,
  applied_coupon_code,
  created_at,
  updated_at,
  cart_items (
    id,
    product_id,
    quantity,
    unit_price,
    created_at,
    updated_at,
    product:products (
      id,
      name,
      slug,
      description,
      sku,
      price,
      professional_price,
      currency,
      ce_certified,
      warranty_months,
      technical_specs,
      active,
      brand:brands ( name, slug ),
      category:categories ( name, slug ),
      media:product_media ( url, position )
    )
  )
` as const;

type CartRow = {
  id: string;
  user_id: string;
  applied_coupon_code: string | null;
  created_at: string;
  updated_at: string;
  cart_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    created_at: string;
    updated_at: string;
    product: unknown;
  }>;
};

function createAuthenticatedClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const request = getRequest();
  const authorization = request?.headers.get("authorization");

  if (!url || !key) throw new Error("Supabase configuration is missing");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");

  return createClient<Database>(url, key, {
    global: {
      headers: { Authorization: authorization },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getCurrentUserId(supabase: ReturnType<typeof createAuthenticatedClient>) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return data.user.id;
}

async function getOrCreateCart(supabase: ReturnType<typeof createAuthenticatedClient>, userId: string) {
  const { data: existing, error: readError } = await supabase
    .from("carts")
    .select("id, user_id, applied_coupon_code, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw new Error("Cart unavailable");
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id, user_id, applied_coupon_code, created_at, updated_at")
    .single();

  if (createError || !created) throw new Error("Unable to create cart");
  return created;
}

async function loadCart(supabase: ReturnType<typeof createAuthenticatedClient>, userId: string) {
  const cart = await getOrCreateCart(supabase, userId);
  const { data, error } = await supabase
    .from("carts")
    .select(CART_SELECT)
    .eq("id", cart.id)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Cart unavailable");
  return data as unknown as CartRow;
}

export const getCurrentCart = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAuthenticatedClient();
  const userId = await getCurrentUserId(supabase);
  return { cart: await loadCart(supabase, userId), error: null as string | null };
});

export const addCartItem = createServerFn({ method: "POST" })
  .validator((input: { productId: string; quantity?: number }) => {
    const productId = String(input?.productId ?? "").trim();
    const quantity = Number(input?.quantity ?? 1);
    if (!productId) throw new Error("Invalid product");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new Error("Invalid quantity");
    }
    return { productId, quantity };
  })
  .handler(async ({ data }) => {
    const supabase = createAuthenticatedClient();
    const userId = await getCurrentUserId(supabase);
    const cart = await getOrCreateCart(supabase, userId);

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price, active")
      .eq("id", data.productId)
      .eq("active", true)
      .maybeSingle();

    if (productError || !product) throw new Error("Product unavailable");

    const { data: existing, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", data.productId)
      .maybeSingle();

    if (existingError) throw new Error("Cart unavailable");

    if (existing) {
      const nextQuantity = existing.quantity + data.quantity;
      if (nextQuantity > 100) throw new Error("Maximum quantity reached");
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity, unit_price: product.price })
        .eq("id", existing.id)
        .eq("cart_id", cart.id);
      if (error) throw new Error("Unable to update cart");
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ cart_id: cart.id, product_id: product.id, quantity: data.quantity, unit_price: product.price });
      if (error) throw new Error("Unable to add product to cart");
    }

    return { cart: await loadCart(supabase, userId), error: null as string | null };
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .validator((input: { itemId: string; quantity: number }) => {
    const itemId = String(input?.itemId ?? "").trim();
    const quantity = Number(input?.quantity);
    if (!itemId) throw new Error("Invalid cart item");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new Error("Invalid quantity");
    }
    return { itemId, quantity };
  })
  .handler(async ({ data }) => {
    const supabase = createAuthenticatedClient();
    const userId = await getCurrentUserId(supabase);
    const cart = await getOrCreateCart(supabase, userId);

    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select("id, product_id")
      .eq("id", data.itemId)
      .eq("cart_id", cart.id)
      .maybeSingle();

    if (itemError || !item) throw new Error("Cart item unavailable");

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("price, active")
      .eq("id", item.product_id)
      .eq("active", true)
      .maybeSingle();

    if (productError || !product) throw new Error("Product unavailable");

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: data.quantity, unit_price: product.price })
      .eq("id", data.itemId)
      .eq("cart_id", cart.id);

    if (error) throw new Error("Unable to update cart");
    return { cart: await loadCart(supabase, userId), error: null as string | null };
  });

export const removeCartItem = createServerFn({ method: "POST" })
  .validator((input: { itemId: string }) => {
    const itemId = String(input?.itemId ?? "").trim();
    if (!itemId) throw new Error("Invalid cart item");
    return { itemId };
  })
  .handler(async ({ data }) => {
    const supabase = createAuthenticatedClient();
    const userId = await getCurrentUserId(supabase);
    const cart = await getOrCreateCart(supabase, userId);
    const { error } = await supabase.from("cart_items").delete().eq("id", data.itemId).eq("cart_id", cart.id);
    if (error) throw new Error("Unable to remove cart item");
    return { cart: await loadCart(supabase, userId), error: null as string | null };
  });

export const clearCurrentCart = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = createAuthenticatedClient();
  const userId = await getCurrentUserId(supabase);
  const cart = await getOrCreateCart(supabase, userId);
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (error) throw new Error("Unable to clear cart");
  return { cart: await loadCart(supabase, userId), error: null as string | null };
});
