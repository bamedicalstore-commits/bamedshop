import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { MOCK_PRODUCTS } from "@/constants/navigation";

export const Route = createFileRoute("/account/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const items = MOCK_PRODUCTS.slice(0, 3);
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Votre wishlist est vide"
        description="Ajoutez des produits à votre wishlist depuis le catalogue."
        action={
          <Button asChild>
            <Link to="/catalogue">Voir le catalogue</Link>
          </Button>
        }
      />
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
