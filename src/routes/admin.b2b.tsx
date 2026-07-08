import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/b2b")({
  component: B2BPage,
});

const ACCOUNTS = [
  { name: "Clinique El Manar", contact: "Dr. Ben Salah", status: "active", orders: 42, ca: "18 240 DT" },
  { name: "Pharmacie Nour", contact: "M. Trabelsi", status: "active", orders: 27, ca: "9 130 DT" },
  { name: "Cabinet Dermo+", contact: "Dr. Kouki", status: "pending", orders: 0, ca: "—" },
  { name: "Kiné Sfax Center", contact: "M. Amri", status: "active", orders: 15, ca: "6 420 DT" },
] as const;

function B2BPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Comptes B2B</h1>
          <p className="text-sm text-muted-foreground">Gestion des professionnels de santé.</p>
        </div>
        <Button>
          <Building2 aria-hidden="true" /> Nouveau compte
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>CA cumulé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACCOUNTS.map((a) => (
                <TableRow key={a.name}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.contact}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "active" ? "success" : "warning"}>
                      {a.status === "active" ? "Actif" : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.orders}</TableCell>
                  <TableCell>{a.ca}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Détails</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
