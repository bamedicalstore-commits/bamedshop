import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { Product } from "@/types/product";

const PHONE = ((import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE ?? "") as string).replace(/\D/g, "");

export function buildWhatsAppOrderUrl(product: Product, quantity = 1): string | null {
  if (!PHONE) return null;
  const message = [
    "Bonjour BA Medical Store,",
    "Je souhaite commander ce produit :",
    `Produit : ${product.name}`,
    product.reference ? `Référence : ${product.reference}` : null,
    `Quantité : ${quantity}`,
    "",
    "Merci de me confirmer la disponibilité et les modalités de livraison.",
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

interface WhatsAppOrderButtonProps extends Omit<ButtonProps, "children"> {
  product: Product;
  quantity?: number;
  label?: string;
}

export function WhatsAppOrderButton({
  product,
  quantity = 1,
  label = "Commander",
  ...rest
}: WhatsAppOrderButtonProps) {
  const href = buildWhatsAppOrderUrl(product, quantity);
  if (!href)
    return (
      <Button type="button" disabled {...rest}>
        <MessageCircle aria-hidden="true" /> Commander
      </Button>
    );
  return (
    <Button asChild {...rest}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle aria-hidden="true" />
        <span>{label}</span>
      </a>
    </Button>
  );
}
