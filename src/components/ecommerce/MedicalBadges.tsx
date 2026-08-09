import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  FlaskConical,
  Snowflake,
  Stethoscope,
  Leaf,
  ScrollText,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type MedicalBadgeKind =
  | "ce"
  | "iso-13485"
  | "rx"
  | "sterile"
  | "cold-chain"
  | "latex-free"
  | "single-use"
  | "reusable"
  | "bio"
  | "hazard";

interface MedicalBadgeProps {
  kind: MedicalBadgeKind;
  label?: string;
  className?: string;
}

const MAP: Record<
  MedicalBadgeKind,
  {
    label: string;
    variant: "soft" | "info" | "warning" | "success" | "destructive" | "muted";
    Icon: typeof ShieldCheck;
    tooltip: string;
  }
> = {
  ce: {
    label: "CE",
    variant: "info",
    Icon: BadgeCheck,
    tooltip: "Marquage CE — Conformité aux normes européennes des dispositifs médicaux",
  },
  "iso-13485": {
    label: "ISO 13485",
    variant: "info",
    Icon: ScrollText,
    tooltip: "ISO 13485 — Système qualité pour dispositifs médicaux",
  },
  rx: {
    label: "Sur ordonnance",
    variant: "warning",
    Icon: Stethoscope,
    tooltip: "Produit nécessitant une prescription médicale",
  },
  sterile: {
    label: "Stérile",
    variant: "success",
    Icon: ShieldCheck,
    tooltip: "Produit stérilisé — usage médical",
  },
  "cold-chain": {
    label: "Chaîne du froid",
    variant: "info",
    Icon: Snowflake,
    tooltip: "Conservation entre 2° et 8° C — chaîne du froid respectée",
  },
  "latex-free": {
    label: "Sans latex",
    variant: "soft",
    Icon: Leaf,
    tooltip: "Produit sans latex — adapté aux personnes allergiques",
  },
  "single-use": {
    label: "Usage unique",
    variant: "muted",
    Icon: FlaskConical,
    tooltip: "À usage unique — ne pas réutiliser",
  },
  reusable: {
    label: "Réutilisable",
    variant: "success",
    Icon: ShieldCheck,
    tooltip: "Réutilisable après désinfection selon protocole fabricant",
  },
  bio: {
    label: "Biocompatible",
    variant: "success",
    Icon: Leaf,
    tooltip: "Matériau biocompatible testé",
  },
  hazard: {
    label: "Précautions",
    variant: "destructive",
    Icon: AlertTriangle,
    tooltip: "Manipulation avec précautions — voir notice",
  },
};

export function MedicalBadge({ kind, label, className }: MedicalBadgeProps) {
  const { label: defaultLabel, variant, Icon, tooltip } = MAP[kind];
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={cn("cursor-help", className)}>
            <Icon aria-hidden="true" />
            {label ?? defaultLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MedicalBadgesProps {
  kinds: MedicalBadgeKind[];
  className?: string;
}

export function MedicalBadges({ kinds, className }: MedicalBadgesProps) {
  if (kinds.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Certifications et propriétés">
      {kinds.map((k) => (
        <li key={k}>
          <MedicalBadge kind={k} />
        </li>
      ))}
    </ul>
  );
}
