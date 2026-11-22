import { Truck } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="hidden bg-primary text-primary-foreground sm:block">
      <div className="container-page flex h-9 items-center justify-center gap-2 text-xs font-medium">
        <Truck className="size-3.5" aria-hidden="true" />
        <span>Livraison offerte dès 200 DT partout en Tunisie · Paiement à la livraison</span>
      </div>
    </div>
  );
}
