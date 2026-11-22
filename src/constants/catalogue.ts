/**
 * Catalogue public — plan B (sans base de données, sans aucun prix).
 *
 * Source : listes fournisseurs Pharmatec (août 2024) et Rossmax, les mêmes que
 * la migration 20260812190000_authoritative_catalogue_seed.sql. Les slugs et
 * références sont identiques à la base pour pouvoir y basculer plus tard.
 *
 * AUCUN PRIX ICI : ni prix d'achat ni prix de vente. Le prix est donné sur
 * WhatsApp tant que les prix de vente ne sont pas validés.
 * Descriptions factuelles uniquement (désignation fournisseur) : aucune
 * caractéristique technique ni allégation santé inventée.
 */

export type CatalogueCategorySlug =
  | "diabete-surveillance-glycemique"
  | "diagnostic-medical"
  | "nebulisation-respiration"
  | "oxymetrie"
  | "thermometrie"
  | "soins-consommables"
  | "mobilite-maintien-domicile"
  | "maternite-allaitement";

export interface CatalogueCategory {
  slug: CatalogueCategorySlug;
  name: string;
}

/** Ordre d'affichage : le diabète d'abord. */
export const CATALOGUE_CATEGORIES: CatalogueCategory[] = [
  { slug: "diabete-surveillance-glycemique", name: "Diabète et surveillance glycémique" },
  { slug: "diagnostic-medical", name: "Tension et diagnostic" },
  { slug: "nebulisation-respiration", name: "Nébulisation et respiration" },
  { slug: "oxymetrie", name: "Oxymétrie" },
  { slug: "thermometrie", name: "Thermométrie" },
  { slug: "soins-consommables", name: "Soins et consommables" },
  { slug: "mobilite-maintien-domicile", name: "Maintien à domicile" },
  { slug: "maternite-allaitement", name: "Maternité et allaitement" },
];

export interface CatalogueProduct {
  slug: string;
  sku: string;
  name: string;
  brand: "Bionime" | "Clickfine" | "Mission" | "Rossmax" | "Sterilance";
  category: CatalogueCategorySlug;
  description: string;
  /** Information de compatibilité vérifiable, affichée sur la fiche. */
  note?: string;
}

const GS550_NOTE =
  "Bandelettes à utiliser avec le lecteur de glycémie Bionime GM550 (gamme Rightest GS550).";

export const CATALOGUE_PRODUCTS: CatalogueProduct[] = [
  // Diabète
  {
    slug: "bionime-gm550-03f",
    sku: "GM550-03F",
    name: "Coffret Bionime GM550 : lecteur + 2 boîtes de 50 bandelettes",
    brand: "Bionime",
    category: "diabete-surveillance-glycemique",
    description:
      "Coffret comprenant le lecteur de glycémie Bionime GM550 et 2 boîtes de 50 bandelettes.",
    note: GS550_NOTE,
  },
  {
    slug: "bionime-gm550-21f",
    sku: "GM550-21F",
    name: "Lecteur de glycémie Bionime GM550",
    brand: "Bionime",
    category: "diabete-surveillance-glycemique",
    description: "Lecteur de glycémie Bionime GM550, vendu seul.",
    note: "Fonctionne avec les bandelettes Bionime GS550.",
  },
  {
    slug: "bionime-gs550-02f",
    sku: "GS550-02F",
    name: "Bandelettes Bionime GS550, boîte de 25",
    brand: "Bionime",
    category: "diabete-surveillance-glycemique",
    description: "Boîte de 25 bandelettes de mesure de la glycémie.",
    note: GS550_NOTE,
  },
  {
    slug: "bionime-gs550-05f",
    sku: "GS550-05F",
    name: "Bandelettes Bionime GS550, boîte de 50",
    brand: "Bionime",
    category: "diabete-surveillance-glycemique",
    description: "Boîte de 50 bandelettes de mesure de la glycémie.",
    note: GS550_NOTE,
  },
  {
    slug: "bionime-gs550-0af",
    sku: "GS550-0AF",
    name: "Bandelettes Bionime GS550, boîte de 100",
    brand: "Bionime",
    category: "diabete-surveillance-glycemique",
    description: "Boîte de 100 bandelettes de mesure de la glycémie.",
    note: GS550_NOTE,
  },
  {
    slug: "sterilance-soft-100",
    sku: "01-0130-100",
    name: "Lancettes Bionime Sterilance Soft, boîte de 100",
    brand: "Sterilance",
    category: "diabete-surveillance-glycemique",
    description: "Boîte de 100 lancettes Sterilance Soft.",
  },
  {
    slug: "sterilance-soft-50",
    sku: "01-0130-50",
    name: "Lancettes Bionime Sterilance Soft, boîte de 50",
    brand: "Sterilance",
    category: "diabete-surveillance-glycemique",
    description: "Boîte de 50 lancettes Sterilance Soft.",
  },
  {
    slug: "bionime-sterilance-press-2",
    sku: "05-063018",
    name: "Lancettes Bionime Sterilance Press 2, boîte de 100",
    brand: "Sterilance",
    category: "diabete-surveillance-glycemique",
    description: "Boîte de 100 lancettes Sterilance Press 2.",
  },
  {
    slug: "clickfine-32gx4mm",
    sku: "3200924",
    name: "Aiguilles pour stylo à insuline Clickfine 32G × 4 mm",
    brand: "Clickfine",
    category: "diabete-surveillance-glycemique",
    description: "Aiguilles Clickfine pour stylo à insuline, 32G, longueur 4 mm.",
  },
  {
    slug: "clickfine-31gx6mm",
    sku: "3200925",
    name: "Aiguilles pour stylo à insuline Clickfine 31G × 6 mm",
    brand: "Clickfine",
    category: "diabete-surveillance-glycemique",
    description: "Aiguilles Clickfine pour stylo à insuline, 31G, longueur 6 mm.",
  },
  {
    slug: "clickfine-31gx8mm",
    sku: "3200926",
    name: "Aiguilles pour stylo à insuline Clickfine 31G × 8 mm",
    brand: "Clickfine",
    category: "diabete-surveillance-glycemique",
    description: "Aiguilles Clickfine pour stylo à insuline, 31G, longueur 8 mm.",
  },

  // Tension et diagnostic
  {
    slug: "rossmax-z1",
    sku: "Z1",
    name: "Tensiomètre électronique Rossmax Z1 (câble USB)",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Tensiomètre électronique Rossmax Z1, avec câble USB.",
  },
  {
    slug: "rossmax-x3",
    sku: "X3",
    name: "Tensiomètre électronique Rossmax X3",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Tensiomètre électronique Rossmax X3, écran moyen.",
  },
  {
    slug: "rossmax-mw701f",
    sku: "MW701F",
    name: "Tensiomètre automatique à brassard Rossmax MW701F",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Tensiomètre automatique à brassard Rossmax MW701F.",
  },
  {
    slug: "rossmax-s150",
    sku: "S150",
    name: "Tensiomètre électronique au poignet Rossmax S150",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Tensiomètre électronique au poignet Rossmax S150.",
  },
  {
    slug: "rossmax-cuff",
    sku: "CUFF",
    name: "Brassard Rossmax universel",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Brassard de tensiomètre Rossmax, taille universelle.",
  },
  {
    slug: "rossmax-cuff-s",
    sku: "CUFF-S",
    name: "Brassard Rossmax, petite taille",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Brassard de tensiomètre Rossmax, petite taille.",
  },
  {
    slug: "rossmax-cuff-m",
    sku: "CUFF-M",
    name: "Brassard Rossmax, taille moyenne",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Brassard de tensiomètre Rossmax, taille moyenne.",
  },
  {
    slug: "rossmax-cuff-l",
    sku: "CUFF-L",
    name: "Brassard Rossmax, grande taille",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Brassard de tensiomètre Rossmax, grande taille.",
  },
  {
    slug: "rossmax-eb100",
    sku: "EB100",
    name: "Stéthoscope Rossmax EB100, tête simple",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Stéthoscope Rossmax à tête simple.",
  },
  {
    slug: "rossmax-eb500",
    sku: "EB500",
    name: "Stéthoscope Rossmax EB500, double tête",
    brand: "Rossmax",
    category: "diagnostic-medical",
    description: "Stéthoscope Rossmax à double tête.",
  },

  // Nébulisation et respiration
  {
    slug: "rossmax-na100",
    sku: "NA100",
    name: "Nébuliseur à piston Rossmax NA100, avec boîtier",
    brand: "Rossmax",
    category: "nebulisation-respiration",
    description: "Nébuliseur à piston Rossmax NA100, livré avec boîtier de rangement.",
  },
  {
    slug: "rossmax-nl100",
    sku: "NL100",
    name: "Nébuliseur à piston Rossmax NL100",
    brand: "Rossmax",
    category: "nebulisation-respiration",
    description: "Nébuliseur à piston Rossmax NL100.",
  },
  {
    slug: "rossmax-nebacc",
    sku: "NEBACC",
    name: "Accessoire nébuliseur Rossmax N1",
    brand: "Rossmax",
    category: "nebulisation-respiration",
    description: "Accessoire pour nébuliseur Rossmax (N1).",
  },
  {
    slug: "rossmax-as175-s",
    sku: "AS175-S",
    name: "Chambre d'inhalation Rossmax, petite taille",
    brand: "Rossmax",
    category: "nebulisation-respiration",
    description: "Chambre d'inhalation Rossmax AS175, petite taille.",
  },
  {
    slug: "rossmax-as175-m",
    sku: "AS175-M",
    name: "Chambre d'inhalation Rossmax, taille moyenne",
    brand: "Rossmax",
    category: "nebulisation-respiration",
    description: "Chambre d'inhalation Rossmax AS175, taille moyenne.",
  },
  {
    slug: "rossmax-as175-l",
    sku: "AS175-L",
    name: "Chambre d'inhalation Rossmax, grande taille",
    brand: "Rossmax",
    category: "nebulisation-respiration",
    description: "Chambre d'inhalation Rossmax AS175, grande taille.",
  },
  {
    slug: "rossmax-v3",
    sku: "V3",
    name: "Unité d'aspiration Rossmax V3",
    brand: "Rossmax",
    category: "nebulisation-respiration",
    description: "Unité d'aspiration Rossmax V3.",
  },

  // Oxymétrie
  {
    slug: "rossmax-sb100",
    sku: "SB100",
    name: "Oxymètre de pouls Rossmax SB100",
    brand: "Rossmax",
    category: "oxymetrie",
    description: "Oxymètre de pouls Rossmax SB100.",
  },
  {
    slug: "rossmax-sa310",
    sku: "SA310",
    name: "Oxymètre de pouls de doigt Rossmax SA310",
    brand: "Rossmax",
    category: "oxymetrie",
    description: "Oxymètre de pouls de doigt Rossmax SA310.",
  },

  // Thermométrie
  {
    slug: "rossmax-tg100",
    sku: "TG100",
    name: "Thermomètre rigide Rossmax TG100",
    brand: "Rossmax",
    category: "thermometrie",
    description: "Thermomètre à embout rigide Rossmax TG100.",
  },
  {
    slug: "rossmax-tg380",
    sku: "TG380",
    name: "Thermomètre flexible Rossmax TG380",
    brand: "Rossmax",
    category: "thermometrie",
    description: "Thermomètre à embout flexible Rossmax TG380.",
  },

  // Soins et consommables
  {
    slug: "sterilance-easy-drip-4mm",
    sku: "18-3204",
    name: "Sterilance Easy Drip 4 mm",
    brand: "Sterilance",
    category: "soins-consommables",
    description: "Sterilance Easy Drip, 4 mm.",
  },
  {
    slug: "sterilance-easy-drip-6mm",
    sku: "18-3106",
    name: "Sterilance Easy Drip 6 mm",
    brand: "Sterilance",
    category: "soins-consommables",
    description: "Sterilance Easy Drip, 6 mm.",
  },
  {
    slug: "sterilance-easy-drip-8mm",
    sku: "18-3108",
    name: "Sterilance Easy Drip 8 mm",
    brand: "Sterilance",
    category: "soins-consommables",
    description: "Sterilance Easy Drip, 8 mm.",
  },
  {
    slug: "sterilance-10-0111",
    sku: "10-0111",
    name: "Lames de bistouri Sterilance n°11, boîte de 100",
    brand: "Sterilance",
    category: "soins-consommables",
    description: "Lames de bistouri chirurgicales Sterilance n°11, 100 lames par boîte.",
  },
  {
    slug: "sterilance-10-0115",
    sku: "10-0115",
    name: "Lames de bistouri Sterilance n°15, boîte de 100",
    brand: "Sterilance",
    category: "soins-consommables",
    description: "Lames de bistouri chirurgicales Sterilance n°15, 100 lames par boîte.",
  },
  {
    slug: "sterilance-10-0123",
    sku: "10-0123",
    name: "Lames de bistouri Sterilance n°23, boîte de 100",
    brand: "Sterilance",
    category: "soins-consommables",
    description: "Lames de bistouri chirurgicales Sterilance n°23, 100 lames par boîte.",
  },
  {
    slug: "sterilance-10-0124",
    sku: "10-0124",
    name: "Lames de bistouri Sterilance n°24, boîte de 100",
    brand: "Sterilance",
    category: "soins-consommables",
    description: "Lames de bistouri chirurgicales Sterilance n°24, 100 lames par boîte.",
  },
  {
    slug: "mission-urinalysis-5b",
    sku: "U031-051-CBN03B",
    name: "Bandelettes urinaires Mission, 5 paramètres, boîte de 100",
    brand: "Mission",
    category: "soins-consommables",
    description: "Bandelettes urinaires Mission Urinalysis 5B, 5 paramètres, 100 bandelettes.",
  },
  {
    slug: "mission-urinalysis-10u",
    sku: "U031-101-CBN03B",
    name: "Bandelettes urinaires Mission, 10 paramètres, boîte de 100",
    brand: "Mission",
    category: "soins-consommables",
    description: "Bandelettes urinaires Mission Urinalysis 10U, 10 paramètres, 100 bandelettes.",
  },

  // Maintien à domicile
  {
    slug: "rossmax-am30",
    sku: "AM30",
    name: "Matelas à bulles d'air Rossmax AM30",
    brand: "Rossmax",
    category: "mobilite-maintien-domicile",
    description: "Matelas à bulles d'air Rossmax AM30.",
  },
  {
    slug: "rossmax-am40",
    sku: "AM40",
    name: "Matelas à cellules d'air Rossmax AM40",
    brand: "Rossmax",
    category: "mobilite-maintien-domicile",
    description: "Matelas à cellules d'air Rossmax AM40.",
  },
  {
    slug: "rossmax-wb101",
    sku: "WB101",
    name: "Pèse-personne Rossmax WB101",
    brand: "Rossmax",
    category: "mobilite-maintien-domicile",
    description: "Pèse-personne Rossmax WB101.",
  },

  // Maternité
  {
    slug: "rossmax-bp5",
    sku: "BP5",
    name: "Tire-lait électrique Rossmax BP5",
    brand: "Rossmax",
    category: "maternite-allaitement",
    description: "Tire-lait électrique Rossmax BP5.",
  },
];

export function findCatalogueProduct(slug: string): CatalogueProduct | undefined {
  return CATALOGUE_PRODUCTS.find((p) => p.slug === slug);
}

export function findCatalogueCategory(slug: CatalogueCategorySlug): CatalogueCategory {
  return CATALOGUE_CATEGORIES.find((c) => c.slug === slug) ?? CATALOGUE_CATEGORIES[0];
}

/** Message WhatsApp pré-rempli pour demander le prix d'un produit. */
export function priceRequestMessage(p: CatalogueProduct): string {
  return `Bonjour BA Medical, je souhaite connaître le prix de : ${p.name} (réf. ${p.sku}).`;
}
