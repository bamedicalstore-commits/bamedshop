import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Check, Droplet, PhoneCall, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { listPublicProductsBySlugs } from "@/lib/catalog.functions";
import { toProduct } from "@/lib/mappers";
import {
  DIABETES_FAQ,
  DIABETES_OFFERS,
  DIABETES_STEPS,
  type DiabetesOffer,
} from "@/constants/diabetes-offer";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  jsonLdScript,
  SITE_NAME,
  whatsappLink,
} from "@/lib/site";

const PATH = "/packs/diabete";
const TITLE = "Pack Diabète : lecteur, bandelettes et lancettes livrés en Tunisie";
const DESCRIPTION =
  "Pack Démarrage (lecteur Bionime GM550 + bandelettes + lancettes) et abonnement trimestriel pour personnes sous insuline. Paiement à la livraison partout en Tunisie.";

const OFFER_SLUGS = Array.from(
  new Set(DIABETES_OFFERS.flatMap((o) => o.lines.map((l) => l.productSlug))),
);

export const Route = createFileRoute("/packs/diabete")({
  loader: async () => {
    const res = await listPublicProductsBySlugs({ data: { slugs: OFFER_SLUGS } });
    return { rows: res.products, error: res.error };
  },
  head: () => ({
    meta: [
      { title: `${TITLE} — ${SITE_NAME}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl(PATH) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(PATH) }],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Packs santé", path: "/packs" },
          { name: "Pack Diabète", path: PATH },
        ]),
      ),
      jsonLdScript(faqJsonLd(DIABETES_FAQ)),
    ],
  }),
  component: DiabetesPackPage,
});

function DiabetesPackPage() {
  const { rows } = Route.useLoaderData();
  const products = rows.map((row) => toProduct(row));
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  return (
    <div className="container-page py-10">
      <Link
        to="/packs"
        className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Tous les packs
      </Link>

      <header className="max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-info-soft text-info">
            <Droplet className="size-6" aria-hidden="true" />
          </span>
          <Badge variant="soft">Diabète</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Un pack pour démarrer l'autosurveillance de la glycémie, puis vos consommables livrés tous
          les 3 mois. Chaque commande est confirmée par téléphone et payée à la livraison.
        </p>
      </header>

      <section aria-labelledby="offres" className="mt-10">
        <h2 id="offres" className="sr-only">
          Nos offres diabète
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {DIABETES_OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      <section aria-labelledby="etapes" className="mt-14">
        <h2 id="etapes" className="text-2xl font-semibold tracking-tight">
          Comment ça marche
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {DIABETES_STEPS.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-border bg-surface p-5">
              <span className="text-sm font-semibold text-primary">Étape {i + 1}</span>
              <p className="mt-1 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {products.length > 0 && (
        <section aria-labelledby="produits" className="mt-14">
          <h2 id="produits" className="text-2xl font-semibold tracking-tight">
            Les produits des packs
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OFFER_SLUGS.map((slug) => bySlug.get(slug))
              .filter((p) => p !== undefined)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}

      <section aria-labelledby="faq" className="mt-14 max-w-3xl">
        <h2 id="faq" className="text-2xl font-semibold tracking-tight">
          Questions fréquentes
        </h2>
        {/* Native <details>: answers stay in the server-rendered HTML (crawlers, AI search). */}
        <div className="mt-4 divide-y divide-border border-y border-border">
          {DIABETES_FAQ.map((entry) => (
            <details key={entry.question} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center font-medium marker:hidden">
                {entry.question}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-10 max-w-3xl text-xs text-muted-foreground">
        Les informations de cette page ne remplacent pas l'avis de votre médecin. Respectez la
        fréquence de contrôle et le traitement qui vous ont été prescrits.
      </p>
    </div>
  );
}

function OfferCard({ offer }: { offer: DiabetesOffer }) {
  const isSubscription = offer.id === "abonnement-insuline";
  const ctaLabel = isSubscription ? "Réserver mon abonnement" : "Réserver ce pack";
  const reserveHref = whatsappLink(
    `Bonjour BA Medical Store, je souhaite réserver : ${offer.name}. ` +
      `Pouvez-vous me rappeler pour confirmer le prix et la livraison ?`,
  );
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{offer.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{offer.tagline}</p>
        </div>
        {isSubscription ? (
          <CalendarClock className="size-6 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Truck className="size-6 shrink-0 text-primary" aria-hidden="true" />
        )}
      </div>

      <p className="mt-4 text-sm">
        <span className="font-medium">Pour qui ? </span>
        {offer.audience}
      </p>

      <h4 className="mt-5 text-sm font-semibold">
        {isSubscription ? "Contenu de chaque livraison (3 mois)" : "Contenu du pack"}
      </h4>
      <ul className="mt-2 space-y-2">
        {offer.lines.map((line) => (
          <li
            key={line.productSlug}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3 text-sm"
          >
            <span>{line.label}</span>
            <span className="shrink-0 font-semibold">× {line.quantity}</span>
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
        {offer.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {h}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-1 flex-col justify-end gap-2">
        {reserveHref ? (
          <Button size="lg" asChild>
            <a href={reserveHref} target="_blank" rel="noopener noreferrer">
              <PhoneCall className="size-4" aria-hidden="true" />
              {ctaLabel}
            </a>
          </Button>
        ) : (
          <Button size="lg" disabled>
            Réservation bientôt disponible
          </Button>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Prix confirmé par téléphone · Paiement à la livraison
        </p>
      </div>
    </Card>
  );
}
