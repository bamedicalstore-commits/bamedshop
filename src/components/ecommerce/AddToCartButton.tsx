import { ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";
import { uiActions } from "@/hooks/useUiStore";
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
  ...rest
}: AddToCartButtonProps) {
  const handle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    uiActions.addToCart(product, quantity);
    if (!silent) {
      toast.success(`${product.name} ajouté au panier`, {
        description: `${quantity} article${quantity > 1 ? "s" : ""}`,
      });
    }
  };
  return (
    <Button onClick={handle} data-product-id={product.id} {...rest}>
      <ShoppingCart aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
