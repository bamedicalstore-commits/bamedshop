import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import type { Availability } from "@/types/product";

const MAP: Record<
  Availability,
  { label: string; variant: "success" | "warning" | "destructive" | "info"; Icon: typeof CheckCircle2 }
> = {
  in_stock: { label: "En stock", variant: "success", Icon: CheckCircle2 },
  low_stock: { label: "Stock limité", variant: "warning", Icon: AlertCircle },
  preorder: { label: "Sur commande", variant: "info", Icon: Clock },
  out_of_stock: { label: "Rupture", variant: "destructive", Icon: XCircle },
  available: { label: "Disponible", variant: "info", Icon: CheckCircle2 },
  unavailable: { label: "Indisponible", variant: "destructive", Icon: XCircle },
};

export function AvailabilityBadge({ status }: { status: Availability }) {
  const { label, variant, Icon } = MAP[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
