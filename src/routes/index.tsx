import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Check, MessageCircle, Phone, Truck } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { DIABETES_FAQ, DIABETES_OFFERS, DIABETES_STEPS } from "@/constants/diabetes-offer";
import {
  absoluteUrl,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  jsonLdScript,
  SITE_NAME,
  SITE_URL,
  whatsappLink,
} from "@/lib/site";

/*
 * Accueil — refonte UX « fiable puis clair » (méthode UX signature 2026).
 * Le job servi : « recevoir mes consommables du diabète chez moi, sans rupture,
 * sans me déplacer ». Une seule action principale : réserver sur WhatsApp.
 * Aucune donnée inventée : pas de chiffres, d'avis ni de marques non vérifiés.
 */

const TITLE = "Bandelettes et consommables diabète livrés chez vous en Tunisie";
const DESCRIPTION =
  "Lecteur Bionime GM550, bandelettes GS550, lancettes et aiguilles pour stylo à insuline. Commande par WhatsApp, paiement à la livraison partout en Tunisie.";

const HOME_FAQ = DIABETES_FAQ.slice(0, 3);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — ${TITLE}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `${SITE_NAME} — ${TITLE}` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
    scripts: [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        email: BUSINESS_EMAIL,
        telephone: `+${BUSINESS_PHONE_E164}`,
        areaServed: "TN",
      }),
    ],
  }),
  component: HomePage,
});

const RESERVE_MESSAGE =
  "Bonjour BA Medical Store, je souhaite commander des consommables pour le diabète. Pouvez-vous me rappeler ?";

function HomePage() {
  const reserveHref = whatsappLink(RESERVE_MESSAGE);

  return (
    <SiteLayout>
      {/* 1 · Le job, et une seule action principale */}
      <section className="border-b border-border bg-gradient-to-b from-primary-soft/60 to-background">
        <div className="container-page py-10 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">
              Diabète · Livraison partout en Tunisie
            </p>
            <h1 className="mt-3 text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Vos bandelettes et consommables diabète, livrés chez vous.
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Bionime, Sterilance et Clickfine, du distributeur officiel en Tunisie. Vous commandez
              sur WhatsApp, vous payez à la livraison.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {reserveHref ? (
                <Button asChild size="lg" className="h-14 text-base">
                  <a href={reserveHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-5" aria-hidden="true" />
                    Commander sur WhatsApp
                  </a>
                </Button>
              ) : null}
              <Button asChild size="lg" variant="outline" className="h-14 text-base">
                <Link to="/packs/diabete">
                  Voir les packs diabète <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              {[
                "Paiement à la livraison",
                "Commande confirmée par appel",
                "Livraison offerte dès 200 DT",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2 · Deux offres seulement (loi de Hick) */}
      <section aria-labelledby="offres" className="container-page py-12">
        <h2 id="offres" className="text-2xl font-semibold tracking-tight">
          Deux façons de commander
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {DIABETES_OFFERS.map((offer) => {
            const isSubscription = offer.id === "abonnement-insuline";
            const Icon = isSubscription ? CalendarClock : Truck;
            return (
              <Link
                key={offer.id}
                to="/packs/diabete"
                className="group flex min-h-[44px] flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{offer.name}</h3>
                  <Icon className="size-6 shrink-0 text-primary" aria-hidden="true" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{offer.tagline}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {offer.lines.map((line) => (
                    <li key={line.productSlug} className="flex justify-between gap-3">
                      <span>{line.label}</span>
                      <span className="shrink-0 font-semibold tabular-nums">× {line.quantity}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Voir le détail
                  <ArrowRight
                    className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3 · Comment ça marche */}
      <section aria-labelledby="etapes" className="border-y border-border bg-surface py-12">
        <div className="container-page">
          <h2 id="etapes" className="text-2xl font-semibold tracking-tight">
            Comment ça marche
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {DIABETES_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 · Questions fréquentes (réponses dans le HTML) */}
      <section aria-labelledby="faq" className="container-page py-12">
        <h2 id="faq" className="text-2xl font-semibold tracking-tight">
          Questions fréquentes
        </h2>
        <div className="mt-4 max-w-3xl divide-y divide-border border-y border-border">
          {HOME_FAQ.map((entry) => (
            <details key={entry.question} className="py-4">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center font-medium marker:hidden">
                {entry.question}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 5 · Contact direct, sans formulaire */}
      <section aria-labelledby="contact" className="container-page pb-14">
        <div className="rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:px-10">
          <h2 id="contact" className="text-2xl font-semibold tracking-tight">
            Une question avant de commander ?
          </h2>
          <p className="mt-2 max-w-xl text-sm opacity-90">
            Tensiomètres, nébuliseurs et autres produits Rossmax : demandez-nous, nous vous
            répondons sur WhatsApp ou par téléphone.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {reserveHref ? (
              <Button asChild size="lg" className="h-12 bg-white text-primary hover:bg-white/90">
                <a href={reserveHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-5" aria-hidden="true" /> WhatsApp
                </a>
              </Button>
            ) : null}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href={`tel:+${BUSINESS_PHONE_E164}`}>
                <Phone className="size-5" aria-hidden="true" /> {BUSINESS_PHONE_DISPLAY}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
