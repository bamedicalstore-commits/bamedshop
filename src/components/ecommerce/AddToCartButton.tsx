import { ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { addCartItem } from "@/lib/cart.functions";
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
  const handle: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.info("Connexion requise", {
        description: "Connectez-vous pour enregistrer votre panier.",
        action: {
          label: "Se connecter",
          onClick: () => window.location.assign("/auth"),
        },
      });
      return;
    }

    try {
      await addCartItem({ data: { productId: product.id, quantity } });
      if (!silent) {
        toast.success(`${product.name} ajouté au panier`, {
          description: `${quantity} article${quantity > 1 ? "s" : ""}`,
        });
      }
    } catch (error) {
      toast.error("Impossible d'ajouter ce produit au panier", {
        description: error instanceof Error ? error.message : "Veuillez réessayer.",
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
