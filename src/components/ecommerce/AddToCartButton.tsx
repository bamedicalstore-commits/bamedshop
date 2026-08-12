import { ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
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
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, addItem } = useCart();

  const handle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    if (!isAuthenticated) {
      toast.info("Connectez-vous pour ajouter au panier", {
        description: "Votre panier est enregistré sur votre compte.",
        action: { label: "Se connecter", onClick: () => navigate({ to: "/auth" }) },
      });
      return;
    }

    addItem.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          if (silent) return;
          toast.success(`${product.name} ajouté au panier`, {
            description: `${quantity} article${quantity > 1 ? "s" : ""}`,
          });
        },
        onError: (error) => {
          toast.error("Ajout impossible", {
            description: error instanceof Error ? error.message : "Veuillez réessayer.",
          });
        },
      },
    );
  };

  return (
    <Button
      onClick={handle}
      data-product-id={product.id}
      disabled={disabled || authLoading || addItem.isPending}
      {...rest}
    >
      {addItem.isPending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <ShoppingCart aria-hidden="true" />
      )}
      <span>{label}</span>
    </Button>
  );
}
