import { ShoppingCart, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useAddToCart";
import type { Product } from "@/types/product";

interface AddToCartButtonProps extends Omit<ButtonProps, "children"> {
  product: Product;
  quantity?: number;
  label?: string;
  /** Silence the toast (useful in mini-cart / quick add flows) */
  silent?: boolean;
}

export function AddToCartButton({
  product,
  quantity = 1,
  label = "Ajouter au panier",
  silent = false,
  onClick,
  disabled,
  ...rest
}: AddToCartButtonProps) {
  const { addToCart, isPending, authLoading } = useAddToCart();

  const handle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    addToCart(product, quantity, { silent });
  };

  return (
    <Button
      onClick={handle}
      data-product-id={product.id}
      disabled={disabled || authLoading || isPending}
      {...rest}
    >
      {isPending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <ShoppingCart aria-hidden="true" />
      )}
      <span>{label}</span>
    </Button>
  );
}
