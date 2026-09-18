import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { AnnouncementBar } from "./AnnouncementBar";
import { SmartSearch } from "@/components/ecommerce/SmartSearch";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SmartSearch />
      <FloatingWhatsApp />
    </div>
  );
}
