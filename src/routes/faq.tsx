import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { DIABETES_FAQ } from "@/constants/diabetes-offer";
import { absoluteUrl, faqJsonLd, jsonLdScript, SITE_NAME, type FaqEntry } from "@/lib/site";

/*
 * FAQ — seulement des réponses vérifiables.
 * Retirés : paiement par carte (Konnect/Flouci), « compte pro », programme
 * « BA Medical+ », retours sous 14 jours, délais 24-48 h : aucun n'est en place.
 * Frais de livraison : règle de la base (8 DT sous 200 DT, offerte au-delà).
 */

const DELIVERY_FAQ: FaqEntry[] = [
  {
    question: "Où livrez-vous et combien coûte la livraison ?",
    answer:
      "Nous livrons partout en Tunisie. La livraison coûte 8 DT pour une commande de moins de 200 DT, et elle est offerte à partir de 200 DT.",
  },
  {
    question: "Comment commander ?",
    answer:
      "Envoyez-nous un message sur WhatsApp ou appelez-nous. Nous confirmons avec vous les produits, les quantités, le prix et l'adresse avant chaque expédition.",
  },
];

const FAQS: FaqEntry[] = [...DELIVERY_FAQ, ...DIABETES_FAQ];

const TITLE = "Questions fréquentes";
const DESCRIPTION =
  "Livraison, paiement à la livraison, bandelettes compatibles Bionime GM550, abonnement trimestriel : les réponses de BA Medical Store.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `${TITLE} — ${SITE_NAME}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `${TITLE} — ${SITE_NAME}` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/faq") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/faq") }],
    scripts: [jsonLdScript(faqJsonLd(FAQS))],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <div className="container-page py-12">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
          <p className="mt-3 text-muted-foreground">
            Une autre question ? Écrivez-nous sur WhatsApp ou appelez-nous.
          </p>
        </header>
        {/* Native <details> : les réponses restent dans le HTML (Google, IA). */}
        <div className="mt-8 max-w-3xl divide-y divide-border border-y border-border">
          {FAQS.map((entry) => (
            <details key={entry.question} className="py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-base font-medium marker:hidden">
                {entry.question}
              </summary>
              <p className="mt-2 text-muted-foreground">{entry.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
