import { Truck } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="hidden bg-primary text-primary-foreground sm:block">
      <div className="container-page flex h-9 items-center justify-center gap-2 text-xs font-medium">
        <Truck className="size-3.5" aria-hidden="true" />
        <span>Livraison offerte dès 200 DT sur toute la Tunisie · Retour sous 14 jours</span>
      </div>
    </div>
  );
}
