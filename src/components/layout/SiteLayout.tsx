import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { AnnouncementBar } from "./AnnouncementBar";
import { SmartSearch } from "@/components/ecommerce/SmartSearch";
import { MiniCart } from "@/components/ecommerce/MiniCart";
import { CompareDrawer, CompareFab } from "@/components/ecommerce/CompareDrawer";
import { QuickView } from "@/components/ecommerce/QuickView";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />

      {/* Global overlays — mounted once, driven by useUiStore */}
      <SmartSearch />
      <MiniCart />
      <CompareDrawer />
      <QuickView />
      <CompareFab />
      <FloatingWhatsApp />
    </div>
  );
}
