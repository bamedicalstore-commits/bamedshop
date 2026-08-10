import { Link } from "@tanstack/react-router";
import { Building2, FileText, Percent, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "wide" | "compact";
}

export function B2BBanner({ className, variant = "wide" }: Props) {
  const perks = [
    { Icon: Percent, label: "Tarifs dégressifs & remises volume" },
    { Icon: FileText, label: "Devis instantanés avec TVA détaillée" },
    { Icon: Users, label: "Interlocuteur pro dédié" },
    { Icon: Building2, label: "Facturation entreprise & 30j" },
  ];
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-brand)]",
        className,
      )}
      aria-labelledby="b2b-heading"
    >
      {/* Motif décoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25), transparent 45%)",
        }}
      />
      <div
        className={cn(
          "relative grid gap-8 p-8 md:p-12",
          variant === "wide"
            ? "md:grid-cols-2 md:items-center"
            : "md:grid-cols-[1fr_auto] md:items-center",
        )}
      >
        <div className="space-y-4">
          <Badge variant="soft" className="border-white/40 bg-white/15 text-primary-foreground">
            <Building2 aria-hidden="true" /> Compte Pro B2B
          </Badge>
          <h2 id="b2b-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Équipez votre structure de santé avec un compte pro
          </h2>
          <p className="max-w-xl text-sm text-primary-foreground/90 sm:text-base">
            Cabinets, cliniques, pharmacies, laboratoires — bénéficiez de tarifs négociés, devis en
            24h, facturation à échéance et livraison prioritaire partout en Tunisie.
          </p>

          {variant === "wide" && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {perks.map((p) => (
                <li key={p.label} className="flex items-center gap-2 text-sm">
                  <span className="grid size-7 place-items-center rounded-full bg-white/20">
                    <p.Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span>{p.label}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link to="/contact">
                Demander un compte pro <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/60 bg-transparent text-primary-foreground hover:bg-white/10"
            >
              <Link to="/faq">Grille tarifaire B2B</Link>
            </Button>
          </div>
        </div>

        {variant === "wide" && (
          <div className="relative hidden md:block">
            <div className="rounded-2xl border border-white/30 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-primary-foreground/80">
                Économie moyenne
              </p>
              <p className="mt-1 text-5xl font-bold">−22%</p>
              <p className="mt-1 text-sm text-primary-foreground/90">
                sur les 100 références consommables les plus commandées
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-primary-foreground/80">Clients pros</p>
                  <p className="text-lg font-bold">1 400+</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-primary-foreground/80">Villes livrées</p>
                  <p className="text-lg font-bold">24/24</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
