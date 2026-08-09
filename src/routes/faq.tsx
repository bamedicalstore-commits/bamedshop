import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Quels sont les délais de livraison ?", a: "Nous livrons partout en Tunisie sous 24 à 48h ouvrées. La livraison est offerte dès 200 DT d'achat." },
  { q: "Puis-je bénéficier de tarifs professionnels ?", a: "Oui, créez un compte pro (cabinet, clinique, entreprise) pour accéder à des tarifs négociés et à un interlocuteur dédié." },
  { q: "Vos produits sont-ils certifiés ?", a: "Tous nos produits sont marqués CE et respectent les normes internationales applicables au matériel médical." },
  { q: "Comment retourner un produit ?", a: "Vous disposez de 14 jours après réception pour retourner un produit non ouvert et non utilisé. Contactez notre support pour initier le retour." },
  { q: "Proposez-vous des abonnements ?", a: "Oui, notre programme BA Medical+ permet aux professionnels de recevoir automatiquement leurs consommables à intervalle défini, avec remises exclusives." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Carte bancaire via Konnect ou Flouci, paiement à la livraison, virement bancaire pour les comptes pros." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — BA Medical Store" },
      { name: "description", content: "Réponses aux questions fréquentes : livraison, retours, comptes pros, paiements, certifications." },
      { property: "og:title", content: "FAQ — BA Medical Store" },
      { property: "og:description", content: "Toutes les réponses à vos questions sur BA Medical Store." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <div className="container-page py-14">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions fréquentes</h1>
          <p className="mt-3 text-muted-foreground">
            Vous ne trouvez pas votre réponse ? Notre équipe est là pour vous aider.
          </p>
        </header>
        <div className="mx-auto mt-10 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </SiteLayout>
  );
}
