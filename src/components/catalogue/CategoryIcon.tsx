import {
  Activity,
  Baby,
  BedSingle,
  Droplet,
  HeartPulse,
  Package,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { CatalogueCategorySlug } from "@/constants/catalogue";
import { cn } from "@/lib/utils";

const ICONS: Record<CatalogueCategorySlug, LucideIcon> = {
  "diabete-surveillance-glycemique": Droplet,
  "diagnostic-medical": HeartPulse,
  "nebulisation-respiration": Wind,
  oxymetrie: Activity,
  thermometrie: Thermometer,
  "soins-consommables": Package,
  "mobilite-maintien-domicile": BedSingle,
  "maternite-allaitement": Baby,
};

/**
 * Pictogramme de catégorie. Tient lieu de visuel tant que les photos
 * officielles des fabricants ne sont pas fournies : aucune photo d'origine
 * inconnue n'est publiée.
 */
export function CategoryIcon({
  category,
  className,
}: {
  category: CatalogueCategorySlug;
  className?: string;
}) {
  const Icon = ICONS[category];
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-primary-soft text-primary",
        className,
      )}
    >
      <Icon className="size-1/2" aria-hidden="true" />
    </span>
  );
}
