import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  addCartItem,
  clearMyCart,
  getMyCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart.functions";
import { toMoney, toProduct } from "@/lib/mappers";
import type { Money, Product } from "@/types/product";
import { useAuthSession } from "./useAuthSession";

export interface CartLine {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  /** Prix unitaire autoritatif (DB) converti en minor units. */
  unitPrice: Money;
  lineTotal: Money;
}

export const CART_QUERY_KEY = ["cart", "me"] as const;

/** Panier serveur de l'utilisateur authentifié. */
export function useCart() {
  const { isAuthenticated, loading: authLoading } = useAuthSession();
  const queryClient = useQueryClient();
  const fetchCart = useServerFn(getMyCart);
  const add = useServerFn(addCartItem);
  const update = useServerFn(updateCartItem);
  const remove = useServerFn(removeCartItem);
  const clear = useServerFn(clearMyCart);

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => fetchCart(),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

  const addItem = useMutation({
    mutationFn: (vars: { productId: string; quantity?: number }) => add({ data: vars }),
    onSuccess: invalidate,
  });
  const updateItem = useMutation({
    mutationFn: (vars: { productId: string; quantity: number }) => update({ data: vars }),
    onSuccess: invalidate,
  });
  const removeItem = useMutation({
    mutationFn: (vars: { productId: string }) => remove({ data: vars }),
    onSuccess: invalidate,
  });
  const clearCart = useMutation({
    mutationFn: () => clear(),
    onSuccess: invalidate,
  });

  const lines: CartLine[] = (query.data?.lines ?? []).map((line) => {
    const unitPrice = toMoney(line.unitPrice, line.product.currency);
    return {
      id: line.id,
      productId: line.productId,
      quantity: line.quantity,
      product: toProduct(line.product),
      unitPrice,
      lineTotal: { ...unitPrice, amount: unitPrice.amount * line.quantity },
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal.amount, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return {
    isAuthenticated,
    authLoading,
    lines,
    subtotal,
    count,
    isLoading: authLoading || (isAuthenticated && query.isLoading),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    isMutating:
      addItem.isPending || updateItem.isPending || removeItem.isPending || clearCart.isPending,
  };
}
