import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Info,
  FileText,
  Award,
  ListChecks,
  PlayCircle,
  HelpCircle,
  Puzzle,
  Wrench,
  Boxes,
  History,
  ShieldCheck,
} from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MedicalBadges } from "./MedicalBadges";
import type { Product } from "@/types/product";

interface ProductTabsProps {
  product: Product;
  slots?: {
    description?: ReactNode;
    specs?: ReactNode;
    documents?: ReactNode;
    reviews?: ReactNode;
  };
}

const FAQ_DEFAULT = [
  {
    q: "Ce produit est-il livré avec une garantie ?",
    a: "Oui, garantie constructeur de la durée indiquée sur la fiche produit. Extension possible via BA Medical+.",
  },
  {
    q: "Puis-je obtenir la fiche technique complète ?",
    a: "Oui, elle est disponible dans l'onglet Documents ou sur demande auprès de notre équipe.",
  },
  {
    q: "Ce produit nécessite-t-il une formation ?",
    a: "Pour les usages professionnels, nous proposons un briefing d'utilisation gratuit sur demande.",
  },
];

const HISTORY_DEFAULT = [
  { date: "2026-06-15", version: "v2.1", note: "Amélioration de l'ergonomie du brassard" },
  { date: "2026-01-08", version: "v2.0", note: "Nouvelle génération : Bluetooth intégré" },
  { date: "2025-03-22", version: "v1.5", note: "Certification CE renouvelée" },
];

export function ProductTabs({ product, slots }: ProductTabsProps) {
  return (
    <Tabs defaultValue="desc" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
        <TabsTrigger value="desc">
          <Info aria-hidden="true" /> Description
        </TabsTrigger>
        <TabsTrigger value="specs">
          <ListChecks aria-hidden="true" /> Caractéristiques
        </TabsTrigger>
        <TabsTrigger value="video">
          <PlayCircle aria-hidden="true" /> Vidéo
        </TabsTrigger>
        <TabsTrigger value="docs">
          <FileText aria-hidden="true" /> Documents
        </TabsTrigger>
        <TabsTrigger value="certifs">
          <ShieldCheck aria-hidden="true" /> Certifications
        </TabsTrigger>
        <TabsTrigger value="compat">
          <Puzzle aria-hidden="true" /> Compatibles
        </TabsTrigger>
        <TabsTrigger value="parts">
          <Wrench aria-hidden="true" /> Pièces détachées
        </TabsTrigger>
        <TabsTrigger value="consumables">
          <Boxes aria-hidden="true" /> Consommables
        </TabsTrigger>
        <TabsTrigger value="faq">
          <HelpCircle aria-hidden="true" /> FAQ
        </TabsTrigger>
        <TabsTrigger value="history">
          <History aria-hidden="true" /> Historique
        </TabsTrigger>
        <TabsTrigger value="reviews">
          <Award aria-hidden="true" /> Avis
        </TabsTrigger>
      </TabsList>

      <TabsContent value="desc" className="prose prose-sm max-w-none py-6">
        {slots?.description ?? (
          <p className="text-muted-foreground">
            {product.description ??
              `${product.name} — un équipement fiable, conçu pour un usage professionnel intensif. Description détaillée à compléter au branchement du catalogue.`}
          </p>
        )}
      </TabsContent>

      <TabsContent value="specs" className="py-6">
        {slots?.specs ?? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <SpecRow label="Marque" value={product.brand} />
            <SpecRow label="Catégorie" value={product.category} />
            <SpecRow label="Référence" value={product.reference ?? "—"} />
            <SpecRow label="SKU" value={product.sku ?? "—"} />
            <SpecRow
              label="Garantie"
              value={product.warrantyMonths ? `${product.warrantyMonths} mois` : "—"}
            />
            <SpecRow label="Livraison" value={product.deliveryEta ?? "—"} />
            {product.attributes &&
              Object.entries(product.attributes).map(([k, v]) => (
                <SpecRow key={k} label={k} value={v} />
              ))}
          </dl>
        )}
      </TabsContent>

      <TabsContent value="video" className="py-6">
        <div className="grid aspect-video place-items-center rounded-xl border border-border bg-surface-muted text-muted-foreground">
          <div className="text-center">
            <PlayCircle className="mx-auto size-12 text-primary/60" aria-hidden="true" />
            <p className="mt-2 text-sm">Vidéo de démonstration bientôt disponible</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="docs" className="py-6">
        {slots?.documents ??
          (product.documents && product.documents.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {product.documents.map((d) => (
                <li key={d.url} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" aria-hidden="true" />
                    <span className="text-sm font-medium">{d.label}</span>
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Télécharger
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FileText}
              title="Aucun document"
              description="Les fiches techniques et notices seront disponibles prochainement."
            />
          ))}
      </TabsContent>

      <TabsContent value="certifs" className="py-6">
        <div className="space-y-4">
          {product.certifications && product.certifications.length > 0 ? (
            <MedicalBadges kinds={product.certifications} />
          ) : (
            <p className="text-sm text-muted-foreground">Certifications à compléter.</p>
          )}
          <p className="text-sm text-muted-foreground">
            Tous nos produits sont sourcés chez des fabricants agréés. Documents de conformité
            disponibles sur demande auprès du service qualité.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="compat" className="py-6">
        {product.compatibleWith && product.compatibleWith.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {product.compatibleWith.map((ref) => (
              <Badge key={ref} variant="soft">
                {ref}
              </Badge>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Puzzle}
            title="Aucun produit compatible listé"
            description="La liste des accessoires compatibles sera bientôt disponible."
          />
        )}
      </TabsContent>

      <TabsContent value="parts" className="py-6">
        <EmptyState
          icon={Wrench}
          title="Pièces détachées"
          description="Contactez notre service SAV pour la disponibilité des pièces détachées de ce produit."
        />
      </TabsContent>

      <TabsContent value="consumables" className="py-6">
        <EmptyState
          icon={Boxes}
          title="Consommables associés"
          description="Retrouvez prochainement ici les consommables recommandés pour ce produit."
        />
      </TabsContent>

      <TabsContent value="faq" className="py-6">
        <Accordion type="single" collapsible>
          {FAQ_DEFAULT.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TabsContent>

      <TabsContent value="history" className="py-6">
        <ol className="space-y-4 border-l border-border pl-6">
          {HISTORY_DEFAULT.map((h) => (
            <li key={h.date} className="relative">
              <span
                className="absolute -left-[26px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-primary-soft"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold">{h.version}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>
            </li>
          ))}
        </ol>
      </TabsContent>

      <TabsContent value="reviews" className="py-6">
        {slots?.reviews ?? (
          <EmptyState
            icon={Award}
            title="Aucun avis pour le moment"
            description="Soyez le premier à évaluer ce produit."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
