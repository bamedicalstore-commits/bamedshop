/**
 * Diabetes offer — editorial content for /packs/diabete.
 *
 * Product references are catalogue slugs from the authoritative seed
 * (20260812190000_authoritative_catalogue_seed.sql). This module holds NO
 * prices: prices are owned by the database and only displayed once a
 * product is active with a validated retail price.
 */
import type { FaqEntry } from "@/lib/site";

export interface OfferLine {
  /** Catalogue slug (products.slug). */
  productSlug: string;
  label: string;
  quantity: number;
}

export interface DiabetesOffer {
  id: "demarrage" | "abonnement-insuline";
  name: string;
  tagline: string;
  audience: string;
  lines: OfferLine[];
  highlights: string[];
}

export const DIABETES_OFFERS: DiabetesOffer[] = [
  {
    id: "demarrage",
    name: "Pack Diabète Démarrage",
    tagline: "Tout pour commencer l'autosurveillance de la glycémie",
    audience: "Nouveau diagnostic, changement de lecteur, ou premier achat chez nous.",
    lines: [
      {
        productSlug: "bionime-gm550-03f",
        label: "Coffret Bionime GM550 : lecteur + 2 boîtes de 50 bandelettes",
        quantity: 1,
      },
      {
        productSlug: "sterilance-soft-100",
        label: "Lancettes Bionime Sterilance Soft, boîte de 100",
        quantity: 1,
      },
    ],
    highlights: [
      "Lecteur et bandelettes compatibles (Bionime GM550 / GS550)",
      "100 mesures prêtes à l'emploi",
      "Explication d'utilisation par téléphone à la livraison",
    ],
  },
  {
    id: "abonnement-insuline",
    name: "Abonnement Diabète Insuline",
    tagline: "Vos consommables livrés tous les 3 mois, sans y penser",
    audience: "Personnes sous insuline qui mesurent leur glycémie plusieurs fois par jour.",
    lines: [
      {
        productSlug: "bionime-gs550-05f",
        label: "Bandelettes Bionime GS550, boîte de 50",
        quantity: 6,
      },
      {
        productSlug: "sterilance-soft-100",
        label: "Lancettes Bionime Sterilance Soft, boîte de 100",
        quantity: 3,
      },
      {
        productSlug: "clickfine-32gx4mm",
        label: "Aiguilles pour stylo à insuline Clickfine 32G × 4 mm",
        quantity: 3,
      },
    ],
    highlights: [
      "Une seule livraison par trimestre",
      "Rappel WhatsApp avant chaque envoi : vous ajustez les quantités",
      "Sans engagement : vous arrêtez quand vous voulez",
    ],
  },
];

export const DIABETES_STEPS = [
  {
    title: "Vous réservez",
    text: "Choisissez votre pack et envoyez-nous un message WhatsApp. Aucun paiement en ligne.",
  },
  {
    title: "Nous vous appelons",
    text: "Nous confirmons les produits, les quantités, le prix et l'adresse de livraison.",
  },
  {
    title: "Vous recevez et payez à la livraison",
    text: "Livraison partout en Tunisie. Pour l'abonnement, nous vous recontactons avant chaque envoi.",
  },
];

export const DIABETES_FAQ: FaqEntry[] = [
  {
    question: "Quelles bandelettes utiliser avec le lecteur Bionime GM550 ?",
    answer:
      "Le lecteur Bionime Rightest GM550 fonctionne avec les bandelettes Bionime GS550. Les bandelettes d'une autre marque ne sont pas compatibles.",
  },
  {
    question: "Combien de bandelettes faut-il prévoir par mois ?",
    answer:
      "Cela dépend du nombre de contrôles prescrits par votre médecin. À titre d'exemple, 3 contrôles par jour représentent environ 90 bandelettes et 90 lancettes par mois. Suivez toujours la fréquence indiquée par votre médecin.",
  },
  {
    question: "Comment fonctionne l'abonnement trimestriel ?",
    answer:
      "Vous recevez les consommables de 3 mois en une seule livraison. Avant chaque envoi, nous vous contactons pour confirmer ou ajuster les quantités. Vous pouvez arrêter à tout moment.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "Le paiement se fait à la livraison. Chaque commande est confirmée par téléphone avant l'expédition.",
  },
  {
    question: "Les produits sont-ils authentiques ?",
    answer:
      "Les produits Bionime, Sterilance et Clickfine proviennent du circuit de distribution officiel en Tunisie. Vérifiez la date de péremption indiquée sur chaque boîte à la réception.",
  },
];
