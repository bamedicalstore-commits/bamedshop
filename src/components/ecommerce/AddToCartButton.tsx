import { ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";

interface AddToCartButtonProps extends Omit<ButtonProps, "children"> {
  productId: string;
  productName: string;
  quantity?: number;
  label?: string;
}

export function AddToCartButton({
  productId,
  productName,
  quantity = 1,
  label = "Ajouter au panier",
  ...rest
}: AddToCartButtonProps) {
  const handle = () => {
    // TODO: wired to Commerce domain when backend is connected
    toast.success(`${productName} ajouté au panier`, {
      description: `${quantity} article${quantity > 1 ? "s" : ""}`,
    });
  };
  return (
    <Button onClick={handle} data-product-id={productId} {...rest}>
      <ShoppingCart aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
