import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground">Aperçu de l'activité — dernières 30 jours</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="Chiffre d'affaires"
          value="42 380 DT"
          delta="+12.4%"
          positive
        />
        <KpiCard icon={ShoppingBag} label="Commandes" value="184" delta="+8.1%" positive />
        <KpiCard icon={Users} label="Nouveaux clients" value="57" delta="-2.3%" />
        <KpiCard icon={Package} label="Produits vendus" value="612" delta="+15.7%" positive />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ventes récentes</h2>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["CMD-00147", "Dr. Ben Ali", "289.000 DT", "success", "Livrée"],
                  ["CMD-00146", "Clinique Sfax", "1 245.000 DT", "info", "Expédiée"],
                  ["CMD-00145", "Pharmacie Nour", "68.000 DT", "warning", "En cours"],
                  ["CMD-00144", "Dr. Trabelsi", "412.000 DT", "success", "Livrée"],
                  ["CMD-00143", "Cabinet Dermo+", "156.000 DT", "info", "Expédiée"],
                ].map(([id, client, total, variant, label]) => (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{id}</TableCell>
                    <TableCell>{client}</TableCell>
                    <TableCell>{total}</TableCell>
                    <TableCell>
                      <Badge variant={variant as "success" | "info" | "warning"}>{label}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="size-4 text-warning-foreground" aria-hidden="true" />{" "}
              Alertes stock
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["Gants nitrile — L", "3 restants"],
                ["Seringues 10ml", "8 restants"],
                ["Compresses stériles", "12 restants"],
              ].map(([n, s]) => (
                <li key={n} className="flex items-center justify-between">
                  <span className="text-foreground">{n}</span>
                  <Badge variant="warning">{s}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="size-4 text-primary" aria-hidden="true" /> Activité
            </h2>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                ["Nouvelle commande #147", "il y a 12 min"],
                ["Compte B2B validé — Clinique El Manar", "il y a 1 h"],
                ["Retour initié #142", "il y a 3 h"],
                ["Produit ajouté — Défibrillateur AED", "il y a 5 h"],
              ].map(([msg, when]) => (
                <li key={msg} className="flex flex-col">
                  <span className="text-foreground">{msg}</span>
                  <span className="text-xs text-muted-foreground">{when}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  positive,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  const TrendIcon = positive ? TrendingUp : TrendingDown;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <div
        className={cn(
          "mt-3 inline-flex items-center gap-1 text-xs font-medium",
          positive ? "text-success" : "text-destructive",
        )}
      >
        <TrendIcon className="size-3.5" aria-hidden="true" /> {delta}
        <span className="text-muted-foreground">vs période précédente</span>
      </div>
    </Card>
  );
}
