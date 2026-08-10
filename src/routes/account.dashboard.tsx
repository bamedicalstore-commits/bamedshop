import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Repeat, Heart, ShieldCheck, FileText, Bell, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/account/dashboard")({
  head: () => ({
    meta: [{ title: "Tableau de bord — BA Medical Store" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardPage,
});

const KPIS = [
  { label: "Commandes en cours", value: "2", icon: Package, to: "/account/orders" as const },
  { label: "Abonnements actifs", value: "1", icon: Repeat, to: "/account/subscriptions" as const },
  { label: "Wishlist", value: "8", icon: Heart, to: "/account/wishlist" as const },
  { label: "Garanties", value: "3", icon: ShieldCheck, to: "/account/warranties" as const },
];

const ACTIVITY = [
  { icon: Package, text: "Commande CMD-2026-00147 expédiée", date: "Il y a 2h" },
  { icon: Bell, text: "Nouvelle mise à jour disponible sur votre tensiomètre", date: "Hier" },
  { icon: FileText, text: "Facture disponible pour CMD-2026-00098", date: "Il y a 3j" },
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Link key={k.label} to={k.to}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="mt-1 text-2xl font-bold">{k.value}</p>
                </div>
                <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <k.icon className="size-5" aria-hidden="true" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Activité récente</h2>
            <Button variant="ghost" size="sm" asChild><Link to="/account/notifications">Tout voir</Link></Button>
          </div>
          <ul className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-muted-foreground">
                  <a.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Recommandations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Basées sur votre historique et votre profil.</p>
          <div className="mt-4 space-y-3">
            <Badge variant="soft">BA Medical+</Badge>
            <p className="text-sm">Économisez 15% en activant un abonnement sur vos consommables récurrents.</p>
            <Button asChild size="sm">
              <Link to="/account/subscriptions">Découvrir <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
