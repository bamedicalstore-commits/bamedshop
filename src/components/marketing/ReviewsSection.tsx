import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ecommerce/Rating";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Quote } from "lucide-react";

const REVIEWS = [
  { name: "Dr. Amine B.", role: "Médecin généraliste — Tunis", rating: 5, text: "Livraison express, produits authentiques, service client au top. Ma pharmacie de référence pour l'équipement du cabinet." },
  { name: "Salma T.", role: "Infirmière libérale — Sfax", rating: 5, text: "J'apprécie particulièrement les tarifs pros et la disponibilité des consommables. Zéro rupture depuis un an." },
  { name: "Clinique El Amen", role: "Sousse", rating: 4, text: "Interlocuteur unique, devis rapides, respect des délais. Une vraie plus-value pour notre chaîne d'approvisionnement." },
];

export function ReviewsSection() {
  return (
    <section aria-labelledby="reviews" className="container-page py-14">
      <SectionHeader
        eyebrow="Avis clients"
        title="Ils nous font confiance"
        description="Plus de 1 400 professionnels de santé équipés en Tunisie."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <Card key={r.name} className="flex flex-col gap-4 p-6">
            <Quote className="size-6 text-primary/70" aria-hidden="true" />
            <p className="text-sm text-foreground">{r.text}</p>
            <Rating value={r.rating} size="sm" />
            <div className="mt-auto">
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
