import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface WishlistButtonProps {
  productId: string;
  initial?: boolean;
  onChange?: (id: string, active: boolean) => void;
  size?: "sm" | "md";
  className?: string;
}

export function WishlistButton({
  productId,
  initial = false,
  onChange,
  size = "md",
  className,
}: WishlistButtonProps) {
  const [active, setActive] = useState(initial);
  const handle = () => {
    const next = !active;
    setActive(next);
    onChange?.(productId, next);
  };
  return (
    <Button
      variant="outline"
      size={size === "sm" ? "icon-sm" : "icon"}
      onClick={handle}
      aria-label={active ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
      aria-pressed={active}
      className={cn(
        "rounded-full border-transparent bg-background/90 shadow-sm backdrop-blur",
        active && "text-destructive",
        className,
      )}
    >
      <Heart className={cn(active && "fill-current")} aria-hidden="true" />
    </Button>
  );
}
