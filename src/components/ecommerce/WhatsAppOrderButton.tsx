import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { Product } from "@/types/product";

const RAW_PHONE = (import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE ?? "") as string;
const PHONE = RAW_PHONE.replace(/\D/g, "");

export function buildWhatsAppOrderUrl(product: Product, quantity = 1): string | null {
  if (!PHONE) return null;
  const lines = [
    "Bonjour BA Medical Store,",
    "Je souhaite commander ce produit :",
    `Produit : ${product.name}`,
    product.reference ? `Référence : ${product.reference}` : null,
    `Quantité : ${quantity}`,
    "",
    "Merci de me confirmer la disponibilité et les modalités de livraison.",
  ].filter(Boolean);
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}

interface WhatsAppOrderButtonProps extends Omit<ButtonProps, "children"> {
  product: Product;
  quantity?: number;
  label?: string;
}

export function WhatsAppOrderButton({
  product,
  quantity = 1,
  label = "Commander sur WhatsApp",
  ...rest
}: WhatsAppOrderButtonProps) {
  const href = buildWhatsAppOrderUrl(product, quantity);

  return (
    <Button
      type="button"
      disabled={!href || rest.disabled}
      {...rest}
      asChild={Boolean(href)}
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" />
          <span>{label}</span>
        </a>
      ) : (
        <>
          <MessageCircle aria-hidden="true" />
          <span>WhatsApp indisponible</span>
        </>
      )}
    </Button>
  );
}
