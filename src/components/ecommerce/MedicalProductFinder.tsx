/**
 * Medical Product Finder — assistant guidé 3 étapes.
 * Aide l'utilisateur à cibler la bonne catégorie selon son profil,
 * son besoin et son budget. Redirige vers le catalogue filtré.
 */
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CATEGORIES, PROFESSIONAL_PROFILES, MOCK_PRODUCTS } from "@/constants/navigation";
import type { ProfessionalProfile, Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

type Step = 0 | 1 | 2 | 3;

interface State {
  profile: ProfessionalProfile | null;
  categorySlug: string | null;
  budget: number; // in DT (dinars)
}

const INITIAL: State = { profile: null, categorySlug: null, budget: 2000 };

export function MedicalProductFinder({ className }: { className?: string }) {
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState<State>(INITIAL);

  const matches = useMemo(() => matchProducts(state), [state]);

  const canNext =
    (step === 0 && state.profile !== null) ||
    (step === 1 && state.categorySlug !== null) ||
    step === 2;

  const reset = () => {
    setState(INITIAL);
    setStep(0);
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-10",
        className,
      )}
      aria-labelledby="finder-heading"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"
        style={{ background: "radial-gradient(circle at 100% 0%, var(--primary-soft), transparent 60%)" }}
      />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-brand)]">
              <Compass aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Product Finder
              </p>
              <h2 id="finder-heading" className="text-xl font-bold sm:text-2xl">
                Trouvez le bon matériel en 30 secondes
              </h2>
            </div>
          </div>
          <Stepper current={step} total={4} />
        </div>

        <div className="min-h-[280px]">
          {step === 0 && (
            <StepBlock title="Vous êtes…" description="Sélectionnez votre profil pour des recommandations pertinentes.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROFESSIONAL_PROFILES.map((p) => (
                  <ChoiceCard
                    key={p.value}
                    label={p.label}
                    description={p.description}
                    active={state.profile === p.value}
                    onClick={() => setState((s) => ({ ...s, profile: p.value }))}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 1 && (
            <StepBlock title="Quel type de matériel cherchez-vous ?" description="Choisissez la catégorie principale.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORIES.map((c) => (
                  <ChoiceCard
                    key={c.slug}
                    label={c.name}
                    description={c.description}
                    active={state.categorySlug === c.slug}
                    onClick={() => setState((s) => ({ ...s, categorySlug: c.slug }))}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock title="Votre budget indicatif" description="Nous filtrerons les produits en conséquence.">
              <div className="mx-auto max-w-lg space-y-6 pt-4">
                <div className="rounded-2xl border border-border bg-surface p-6 text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Budget max</p>
                  <p className="mt-2 text-4xl font-bold text-primary">
                    {state.budget} <span className="text-lg font-semibold">DT</span>
                  </p>
                </div>
                <Slider
                  value={[state.budget]}
                  onValueChange={(v) => setState((s) => ({ ...s, budget: v[0] }))}
                  min={50}
                  max={5000}
                  step={50}
                  aria-label="Budget maximum en dinars"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50 DT</span>
                  <span>5000 DT</span>
                </div>
              </div>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock
              title={`${matches.length} produit${matches.length > 1 ? "s" : ""} recommandé${matches.length > 1 ? "s" : ""}`}
              description="Notre sélection basée sur votre profil et votre budget."
            >
              {matches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Aucun produit ne correspond exactement. Essayez d'élargir votre budget ou de changer de catégorie.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {matches.slice(0, 3).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" onClick={reset}>
                  <ArrowLeft aria-hidden="true" /> Recommencer
                </Button>
                <Button asChild size="lg">
                  <Link to="/catalogue">
                    <Sparkles aria-hidden="true" /> Voir tous les résultats
                  </Link>
                </Button>
              </div>
            </StepBlock>
          )}
        </div>

        {step < 3 && (
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              disabled={step === 0}
            >
              <ArrowLeft aria-hidden="true" /> Retour
            </Button>
            <Button
              onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
              disabled={!canNext}
              size="lg"
            >
              {step === 2 ? "Voir les résultats" : "Continuer"} <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function StepBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ChoiceCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
        "hover:border-primary/50 hover:shadow-[var(--shadow-soft)]",
        active
          ? "border-primary bg-primary-soft shadow-[var(--shadow-brand)]"
          : "border-border bg-surface",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn("text-sm font-semibold", active ? "text-primary" : "text-foreground")}>
          {label}
        </span>
        {active && <Check className="size-4 text-primary" aria-hidden="true" />}
      </div>
      {description && <span className="text-xs text-muted-foreground">{description}</span>}
    </button>
  );
}

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Progression">
      {Array.from({ length: total }).map((_, i) => (
        <li
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-8 bg-primary" : i < current ? "w-4 bg-primary/60" : "w-4 bg-border",
          )}
          aria-current={i === current ? "step" : undefined}
        />
      ))}
    </ol>
  );
}

function matchProducts(state: State): Product[] {
  const budgetMinor = state.budget * 1000;
  return MOCK_PRODUCTS.filter((p) => {
    if (state.categorySlug && p.categorySlug !== state.categorySlug) return false;
    if (state.profile && p.professionalProfiles && p.professionalProfiles.length > 0) {
      if (!p.professionalProfiles.includes(state.profile)) return false;
    }
    if (p.price.amount > budgetMinor) return false;
    return true;
  }).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}
