import { Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";

const FAQ = [
  { q: "Quels sont les délais de livraison ?", a: "24 à 48h ouvrées partout en Tunisie via nos partenaires logistiques. Livraison offerte dès 200 DT d'achat." },
  { q: "Vos produits sont-ils tous certifiés ?", a: "Oui, 100% de notre catalogue est certifié CE ou ISO 13485. Traçabilité et documents disponibles sur demande." },
  { q: "Puis-je obtenir un devis professionnel ?", a: "Absolument. Créez un compte pro ou contactez notre équipe B2B pour des tarifs dégressifs et un interlocuteur dédié." },
  { q: "Quelle est votre politique de retour ?", a: "Retour sous 14 jours pour tout produit non ouvert. Consommables stériles exclus pour raisons sanitaires." },
  { q: "Acceptez-vous les commandes hospitalières ?", a: "Oui, nous travaillons avec cliniques, hôpitaux publics et privés. Facturation groupée, bons de commande acceptés." },
];

export function FaqTeaser() {
  return (
    <section aria-labelledby="faq" className="container-page py-14">
      <SectionHeader eyebrow="Vos questions" title="On répond à tout" />
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible>
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 text-center">
          <Button asChild variant="outline"><Link to="/faq">Voir toutes les questions</Link></Button>
        </div>
      </div>
    </section>
  );
}
