import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { uiActions } from "@/hooks/useUiStore";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";

/**
 * Action d'ajout au panier réel (Supabase, RLS utilisateur).
 * Invité : aucun faux succès — un chemin de connexion explicite est proposé.
 */
export function useAddToCart() {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, addItem } = useCart();

  function addToCart(product: Product, quantity = 1, options?: { silent?: boolean }) {
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
          uiActions.openOverlay("miniCart");
          if (options?.silent) return;
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
  }

  return { addToCart, isAuthenticated, isPending: addItem.isPending, authLoading };
}
