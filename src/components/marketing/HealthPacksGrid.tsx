import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { HEALTH_PACKS } from "@/constants/health-packs";
import { cn } from "@/lib/utils";

export function HealthPacksGrid({ limit }: { limit?: number }) {
  const packs = limit ? HEALTH_PACKS.slice(0, limit) : HEALTH_PACKS;
  return (
    <section aria-labelledby="packs" className="container-page py-14">
      <SectionHeader
        eyebrow="Packs santé"
        title="Sélections prêtes à l'emploi"
        description="Des ensembles pensés pour un usage précis, à prix packagé."
        actionLabel="Tous les packs"
        actionTo="/packs"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((p) => (
          <Link key={p.slug} to="/packs/$slug" params={{ slug: p.slug }} className="group">
            <Card className="flex h-full flex-col gap-4 p-6 transition-shadow group-hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl", p.color)}>
                  <p.icon className="size-6" aria-hidden="true" />
                </span>
                <Badge variant="soft">{p.savings}</Badge>
              </div>
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.tagline}</p>
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{p.audience}</span>
                <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
