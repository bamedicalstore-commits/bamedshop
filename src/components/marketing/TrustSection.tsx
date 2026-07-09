import { ShieldCheck, Truck, Headset, Award, Lock, RotateCcw } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { cn } from "@/lib/utils";

interface TrustItem {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}

const DEFAULT_ITEMS: TrustItem[] = [
  { icon: ShieldCheck, title: "Produits certifiés", description: "Dispositifs marquage CE et normes ISO 13485." },
  { icon: Truck, title: "Livraison rapide", description: "Expédition sous 24h · offerte dès 200 DT." },
  { icon: RotateCcw, title: "Retours 14 jours", description: "Retour gratuit, remboursement sous 7 jours." },
  { icon: Lock, title: "Paiement sécurisé", description: "Konnect, Flouci, virement et carte bancaire." },
  { icon: Headset, title: "Support pro dédié", description: "Conseillers médicaux 6j/7 pour B2B." },
  { icon: Award, title: "Sélection experte", description: "Curated par des pharmaciens et distributeurs Pharmatec." },
];

interface TrustSectionProps {
  variant?: "grid" | "row";
  showHeader?: boolean;
  items?: TrustItem[];
  className?: string;
}

export function TrustSection({
  variant = "grid",
  showHeader = true,
  items = DEFAULT_ITEMS,
  className,
}: TrustSectionProps) {
  return (
    <section className={cn("container-page", className)} aria-labelledby="trust-heading">
      {showHeader && (
        <SectionHeader
          eyebrow="Confiance"
          title="Pourquoi les professionnels nous choisissent"
          description="Un service pensé pour les exigences de la santé — sécurité, traçabilité, réactivité."
        />
      )}
      <h2 id="trust-heading" className="sr-only">
        Nos engagements de confiance
      </h2>
      <ul
        className={cn(
          "grid gap-4",
          variant === "grid"
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
        )}
        role="list"
      >
        {items.map((item) => (
          <li
            key={item.title}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
