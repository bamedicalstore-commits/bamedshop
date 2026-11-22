import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { AnnouncementBar } from "./AnnouncementBar";
import { MiniCart } from "@/components/ecommerce/MiniCart";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />

      {/* Overlays globaux. Recherche, comparaison et aperçu rapide retirés : ils
          affichaient des produits fictifs. Ils reviendront avec le vrai catalogue.
          Bouton WhatsApp flottant retiré : l'en-tête fixe porte déjà cette action. */}
      <MiniCart />
    </div>
  );
}
