import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Package } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  component: OrdersPage,
});

const ORDERS = [
  { id: "CMD-2025-00147", date: "10 mars 2025", total: "289.000 DT", status: "delivered" },
  { id: "CMD-2025-00098", date: "22 février 2025", total: "412.000 DT", status: "shipped" },
  { id: "CMD-2025-00042", date: "05 février 2025", total: "89.000 DT", status: "processing" },
] as const;

const STATUS_MAP = {
  delivered: { label: "Livrée", variant: "success" },
  shipped: { label: "Expédiée", variant: "info" },
  processing: { label: "En traitement", variant: "warning" },
} as const;

function OrdersPage() {
  if (ORDERS.length === 0) {
    return <EmptyState icon={Package} title="Aucune commande" description="Vos commandes apparaîtront ici." />;
  }
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b p-6"><h2 className="text-lg font-semibold">Mes commandes</h2></div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDERS.map((o) => {
              const s = STATUS_MAP[o.status];
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.date}</TableCell>
                  <TableCell>{o.total}</TableCell>
                  <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Détails</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
