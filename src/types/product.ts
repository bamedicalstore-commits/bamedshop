import type { MedicalBadgeKind } from "@/components/ecommerce/MedicalBadges";

export type Currency = "TND" | "EUR" | "USD";

export type Money = {
  amount: number; // in minor units (millimes for TND)
  currency: Currency;
};

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

/** Cible d'utilisation métier — filtre catalogue. */
export type UsageProfile = "professional" | "personal" | "both";

/** Profil professionnel — Product Finder. */
export type ProfessionalProfile =
  | "particulier"
  | "infirmier"
  | "medecin"
  | "cabinet"
  | "clinique"
  | "pharmacie";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  shortDescription?: string;
  description?: string;
  images: string[];
  price: Money;
  compareAtPrice?: Money;
  rating?: number;
  ratingCount?: number;
  availability: Availability;
  isNew?: boolean;
  isBestSeller?: boolean;
  discountPercent?: number;
  sku?: string;
  reference?: string;
  variants?: ProductVariant[];
  attributes?: Record<string, string>;
  documents?: { label: string; url: string }[];

  // -------- Métier médical (v2) --------
  /** Certifications / propriétés médicales — affichées via <MedicalBadges />. */
  certifications?: MedicalBadgeKind[];
  /** Cible d'utilisation. */
  usage?: UsageProfile;
  /** Profils professionnels adaptés. */
  professionalProfiles?: ProfessionalProfile[];
  /** Requiert une ordonnance médicale. */
  prescriptionRequired?: boolean;
  /** Garantie constructeur en mois. */
  warrantyMonths?: number;
  /** Éligible à l'abonnement BA Medical+ (livraison récurrente). */
  subscriptionEligible?: boolean;
  /** Délai de livraison estimé (ex. "24-48h"). */
  deliveryEta?: string;
  /** Références compatibles (accessoires, consommables). */
  compatibleWith?: string[];
  /** Tags métier libres (utilisés par les filtres). */
  tags?: string[];
};

export type ProductVariant = {
  id: string;
  label: string;
  value: string;
  price?: Money;
  availability?: Availability;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  productCount?: number;
  image?: string;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  productCount?: number;
};
