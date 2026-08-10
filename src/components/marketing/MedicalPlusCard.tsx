import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicalPlusCardProps {
  variant?: "hero" | "compact";
  className?: string;
}

const PERKS = [
  "Livraison offerte sur toutes les commandes",
  "-10 % permanents sur tout le catalogue",
  "Accès prioritaire aux nouveautés",
  "Support pro dédié 7j/7",
  "Reprise & garantie étendue",
];

/**
 * BA Medical+ — carte d'abonnement premium.
 * Réutilisable en page d'accueil (hero) et dans la page compte (compact).
 */
export function MedicalPlusCard({ variant = "hero", className }: MedicalPlusCardProps) {
  if (variant === "compact") {
    return (
      <Card className={cn("relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary-soft to-info-soft p-5", className)}>
        <Badge variant="default" className="mb-3 w-fit gap-1">
          <Crown className="size-3" aria-hidden="true" /> BA Medical+
        </Badge>
        <h3 className="text-base font-bold">Passez à l'abonnement pro</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Livraison offerte, -10 % permanents et bien plus.
        </p>
        <Button asChild size="sm" className="mt-3">
          <Link to="/faq">Découvrir</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/95 via-primary to-primary-hover p-8 text-primary-foreground shadow-[var(--shadow-brand)] sm:p-12",
        className,
      )}
    >
      <div className="absolute -right-16 -top-16 size-72 rounded-full bg-primary-foreground/10 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-info/30 blur-3xl" aria-hidden="true" />

      <div className="relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <Badge variant="default" className="mb-4 gap-1 border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground backdrop-blur">
            <Crown className="size-3" aria-hidden="true" />
            Abonnement Premium
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            BA Medical<span className="text-primary-foreground/80">+</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/85 sm:text-base">
            L'abonnement des professionnels de santé. Économisez sur chaque commande,
            débloquez la livraison offerte et un support prioritaire.
          </p>

          <ul className="mt-6 grid gap-2.5" role="list">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-primary-foreground/95">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">S'abonner — 29 DT/mois</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/faq">En savoir plus</Link>
            </Button>
          </div>
        </div>

        <div className="relative rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 backdrop-blur">
          <Sparkles className="size-6 text-primary-foreground" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-widest text-primary-foreground/70">
            Économie annuelle moyenne
          </p>
          <p className="mt-1 text-4xl font-bold">— 480 DT</p>
          <p className="mt-3 text-xs text-primary-foreground/80">
            Basé sur une consommation moyenne d'un cabinet médical.
            Résiliable à tout moment, sans engagement.
          </p>
        </div>
      </div>
    </Card>
  );
}
