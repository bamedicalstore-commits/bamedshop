import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingWhatsApp({ className }: { className?: string }) {
  const phone = ((import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE ?? "") as string).replace(/\D/g, "");
  if (!phone) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent("Bonjour BA Medical Store, je souhaite obtenir des informations sur vos produits.")}`;

  return (
    <div className={cn("fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6", className)}>
      <Button
        asChild
        variant="floating"
        size="icon-lg"
        aria-label="Contacter BA Medical Store sur WhatsApp"
        className="shadow-[var(--shadow-brand)]"
      >
        <a href={href} target="_blank" rel="noopener noreferrer">
          <MessageCircle />
        </a>
      </Button>
    </div>
  );
}
