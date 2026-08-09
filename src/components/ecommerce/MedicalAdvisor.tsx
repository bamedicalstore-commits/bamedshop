/**
 * Medical Advisor — assistant permettant à l'utilisateur d'indiquer
 * son profil pour personnaliser les recommandations.
 * Persiste dans localStorage pour être réutilisé sur les autres pages.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Stethoscope, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AdvisorProfile =
  | "particulier"
  | "medecin"
  | "infirmier"
  | "kinesitherapeute"
  | "clinique"
  | "pharmacie"
  | "entreprise";

const PROFILES: { value: AdvisorProfile; label: string; description: string; recommendations: string[] }[] = [
  { value: "particulier", label: "Particulier", description: "Usage familial ou personnel", recommendations: ["Diagnostic domicile", "Premiers secours", "Confort"] },
  { value: "medecin", label: "Médecin", description: "Généraliste ou spécialiste libéral", recommendations: ["Diagnostic pro", "Mobilier de cabinet", "Consommables"] },
  { value: "infirmier", label: "Infirmier·ère", description: "Libéral, hospitalier, HAD", recommendations: ["Consommables stériles", "Diagnostic mobile", "EPI"] },
  { value: "kinesitherapeute", label: "Kinésithérapeute", description: "Cabinet ou domicile", recommendations: ["Rééducation", "Électrothérapie", "Confort patient"] },
  { value: "clinique", label: "Clinique / Hôpital", description: "Achats volumiques, appels d'offres", recommendations: ["B2B", "Devis groupés", "Contrats annuels"] },
  { value: "pharmacie", label: "Pharmacie", description: "Officine, revente", recommendations: ["OTC", "Location matériel", "Consommables"] },
  { value: "entreprise", label: "Entreprise", description: "Médecine du travail, sécurité", recommendations: ["Trousses secours", "Défibrillateurs", "EPI collectifs"] },
];

const STORAGE_KEY = "ba-advisor-profile";

export function useAdvisorProfile(): [AdvisorProfile | null, (p: AdvisorProfile | null) => void] {
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as AdvisorProfile | null;
      if (v) setProfile(v);
    } catch { /* noop */ }
  }, []);
  const update = (p: AdvisorProfile | null) => {
    setProfile(p);
    try {
      if (p) localStorage.setItem(STORAGE_KEY, p);
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
  };
  return [profile, update];
}

export function MedicalAdvisor({ className }: { className?: string }) {
  const [profile, setProfile] = useAdvisorProfile();
  const active = PROFILES.find((p) => p.value === profile);

  return (
    <section
      aria-labelledby="advisor-heading"
      className={cn("rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10", className)}
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Stethoscope aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Medical Advisor</p>
          <h2 id="advisor-heading" className="text-xl font-bold sm:text-2xl">
            Personnalisez vos recommandations
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROFILES.map((p) => {
          const selected = profile === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setProfile(selected ? null : p.value)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40 hover:bg-accent",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-semibold">{p.label}</span>
                {selected && <Check className="size-4 text-primary" aria-hidden="true" />}
              </div>
              <span className="text-xs text-muted-foreground">{p.description}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <Card className="mt-6 border-primary/30 bg-primary-soft/40 p-5 animate-fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Recommandations pour {active.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.recommendations.map((r) => (
                  <Badge key={r} variant="soft">{r}</Badge>
                ))}
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/catalogue">
                Voir mon catalogue <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </section>
  );
}
