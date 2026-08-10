import type { LucideIcon } from "lucide-react";
import { HeartPulse, Droplet, Baby, Accessibility, Home, Stethoscope } from "lucide-react";

export interface HealthPack {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string; // background token class
  categories: string[];
  productSlugs: string[]; // references to MOCK_PRODUCTS
  savings: string;
  audience: string;
}

export const HEALTH_PACKS: HealthPack[] = [
  {
    slug: "hypertension",
    name: "Pack Hypertension",
    tagline: "Suivi tensionnel à domicile",
    description: "Tensiomètre validé, brassard confort, carnet de suivi et guide pratique pour un contrôle régulier de la pression artérielle.",
    icon: HeartPulse,
    color: "bg-destructive/10 text-destructive",
    categories: ["Diagnostic", "Consommables"],
    productSlugs: ["tensiometre-omron-m3", "oxymetre-pouls-pro"],
    savings: "Jusqu'à -18%",
    audience: "Patients hypertendus, seniors, suivi post-consultation",
  },
  {
    slug: "diabete",
    name: "Pack Diabète",
    tagline: "Auto-surveillance glycémique",
    description: "Lecteur de glycémie, bandelettes, lancettes stériles et pochette de transport pour une gestion sereine du diabète.",
    icon: Droplet,
    color: "bg-info-soft text-info",
    categories: ["Diagnostic", "Consommables"],
    productSlugs: ["oxymetre-pouls-pro"],
    savings: "-15%",
    audience: "Patients diabétiques type 1 et 2",
  },
  {
    slug: "bebe",
    name: "Pack Bébé",
    tagline: "Soins essentiels 0-24 mois",
    description: "Thermomètre sans contact, mouche-bébé, sérum physiologique, kit de premiers soins nouveau-nés.",
    icon: Baby,
    color: "bg-warning-soft text-warning",
    categories: ["Diagnostic", "Premiers secours"],
    productSlugs: [],
    savings: "-12%",
    audience: "Jeunes parents, sages-femmes",
  },
  {
    slug: "senior",
    name: "Pack Senior",
    tagline: "Confort et sécurité au quotidien",
    description: "Tensiomètre, oxymètre, pilulier hebdomadaire, canne réglable et téléalarme. Sélection dédiée au bien vieillir.",
    icon: Accessibility,
    color: "bg-primary-soft text-primary",
    categories: ["Diagnostic", "Orthopédie"],
    productSlugs: ["tensiometre-omron-m3"],
    savings: "-20%",
    audience: "Personnes âgées, aidants familiaux",
  },
  {
    slug: "maintien-domicile",
    name: "Pack Maintien à domicile",
    tagline: "Équipement complet HAD",
    description: "Lit médicalisé, matelas anti-escarres, potence, table de lit, chaise garde-robe : la solution intégrale hospitalisation à domicile.",
    icon: Home,
    color: "bg-success-soft text-success",
    categories: ["Mobilier médical", "Orthopédie"],
    productSlugs: [],
    savings: "Devis pro",
    audience: "Familles, HAD, services de soins à domicile",
  },
  {
    slug: "cabinet-medical",
    name: "Pack Cabinet Médical",
    tagline: "Installation clé en main",
    description: "Stéthoscope, tensiomètre, otoscope, table d'examen, tabouret, chariot de soins : équipement standard d'un cabinet neuf.",
    icon: Stethoscope,
    color: "bg-primary-soft text-primary",
    categories: ["Diagnostic", "Mobilier médical"],
    productSlugs: ["tensiometre-omron-m3", "oxymetre-pouls-pro", "stethoscope-littmann-classic"],
    savings: "Tarifs pros",
    audience: "Médecins généralistes, spécialistes libéraux",
  },
];

export function findPack(slug: string) {
  return HEALTH_PACKS.find((p) => p.slug === slug);
}
