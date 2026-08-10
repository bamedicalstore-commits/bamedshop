import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Repeat } from "lucide-react";

export const Route = createFileRoute("/account/subscriptions")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">BA Medical+ Pro</h2>
              <Badge variant="success">Actif</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Livraison mensuelle de vos consommables · Prochaine expédition le 5 avril 2025
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Modifier</Button>
            <Button variant="ghost" className="text-destructive hover:text-destructive">
              Annuler
            </Button>
          </div>
        </div>
      </Card>
      <EmptyState
        icon={Repeat}
        title="Ajoutez un abonnement"
        description="Recevez automatiquement vos produits favoris et économisez."
      />
    </div>
  );
}
