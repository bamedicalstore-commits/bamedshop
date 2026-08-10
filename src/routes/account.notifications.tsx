import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Package, Tag, Newspaper } from "lucide-react";

export const Route = createFileRoute("/account/notifications")({
  head: () => ({ meta: [{ title: "Notifications" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

const NOTIFS = [
  {
    icon: Package,
    text: "Votre commande CMD-2026-00147 est en cours de livraison.",
    date: "Il y a 1h",
    unread: true,
  },
  {
    icon: Tag,
    text: "Promo -20% sur les consommables Pharmatec jusqu'au 30 juillet.",
    date: "Hier",
    unread: true,
  },
  {
    icon: Newspaper,
    text: "Nouvel article sur le blog : comment bien contrôler sa tension.",
    date: "Il y a 3j",
    unread: false,
  },
];

const PREFS = [
  {
    key: "orders",
    label: "Commandes & livraisons",
    description: "Confirmations, expéditions, livraisons",
  },
  { key: "promos", label: "Offres & promotions", description: "Réductions, ventes flash, packs" },
  { key: "newsletter", label: "Newsletter santé", description: "Articles blog et conseils" },
  { key: "reminders", label: "Rappels abonnement", description: "Renouvellement BA Medical+" },
];

function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    orders: true,
    promos: true,
    newsletter: false,
    reminders: true,
  });
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Notifications récentes</h2>
        <ul className="mt-4 divide-y divide-border">
          {NOTIFS.map((n, i) => (
            <li key={i} className="flex items-start gap-3 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <n.icon className="size-4" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">{n.text}</p>
                  {n.unread && <Badge variant="info">Nouveau</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{n.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Préférences</h2>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {PREFS.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
              <Switch
                checked={prefs[p.key] ?? false}
                onCheckedChange={(v) => setPrefs((s) => ({ ...s, [p.key]: v }))}
                aria-label={p.label}
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
