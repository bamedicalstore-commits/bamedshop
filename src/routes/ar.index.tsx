import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Check, HeartPulse, MessageCircle, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AR_DIABETES_FAQ,
  AR_DIABETES_OFFERS,
  AR_DIABETES_STEPS,
} from "@/constants/diabetes-offer.ar";
import {
  absoluteUrl,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  faqJsonLd,
  jsonLdScript,
  SITE_NAME,
  whatsappLink,
} from "@/lib/site";

/*
 * Accueil en arabe (/ar). Même parcours que l'accueil français :
 * une action principale (WhatsApp), deux offres, trois étapes, la FAQ.
 * Mise en page propre (en-tête et pied de page courts en arabe) pour ne pas
 * mélanger les langues. Le document passe en dir="rtl" lang="ar" (__root.tsx).
 * Police arabe dédiée : Noto Sans Arabic (Inter ne couvre pas l'arabe).
 */

const TITLE = "أشرطة قياس السكر ومستلزمات السكري تصلك إلى منزلك في تونس";
const DESCRIPTION =
  "جهاز Bionime GM550، أشرطة GS550، واخزات وإبر قلم الأنسولين. اطلب عبر واتساب وادفع عند الاستلام في كامل تونس.";
const RESERVE_MESSAGE =
  "مرحباً BA Medical Store، أريد طلب مستلزمات لمرض السكري. هل يمكنكم الاتصال بي؟";

export const Route = createFileRoute("/ar/")({
  head: () => ({
    meta: [
      { title: `${TITLE} — ${SITE_NAME}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `${TITLE} — ${SITE_NAME}` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/ar") },
      { property: "og:locale", content: "ar_TN" },
    ],
    links: [
      { rel: "canonical", href: absoluteUrl("/ar") },
      { rel: "alternate", hrefLang: "fr", href: absoluteUrl("/") },
      { rel: "alternate", hrefLang: "ar", href: absoluteUrl("/ar") },
      { rel: "alternate", hrefLang: "x-default", href: absoluteUrl("/") },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap",
      },
    ],
    scripts: [jsonLdScript(faqJsonLd(AR_DIABETES_FAQ))],
  }),
  component: ArabicHomePage,
});

/** Numéro de téléphone toujours affiché de gauche à droite. */
function PhoneNumber() {
  return (
    <bdi dir="ltr" className="tabular-nums">
      {BUSINESS_PHONE_DISPLAY}
    </bdi>
  );
}

function ArabicHomePage() {
  const reserveHref = whatsappLink(RESERVE_MESSAGE);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-2">
          <Link to="/ar" className="flex min-h-11 items-center gap-2" aria-label="BA Medical Store">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold" dir="ltr">
              BA Medical Store
            </span>
          </Link>
          <div className="ms-auto flex items-center gap-1">
            <Link
              to="/"
              lang="fr"
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Français
            </Link>
            {reserveHref ? (
              <Button asChild className="h-11 min-w-11 px-3">
                <a
                  href={reserveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="اطلب عبر واتساب"
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  <span className="hidden sm:inline">اطلب</span>
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1 · Le job, une action principale */}
        <section className="border-b border-border bg-gradient-to-b from-primary-soft/60 to-background">
          <div className="container-page py-10 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary">
                السكري · توصيل إلى كامل تراب الجمهورية
              </p>
              <h1 className="mt-3 text-[2rem] font-semibold leading-[1.3] text-foreground sm:text-5xl sm:leading-[1.25]">
                أشرطة قياس السكر ومستلزمات السكري، تصلك إلى باب منزلك.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                منتجات Bionime وSterilance وClickfine من الموزع الرسمي في تونس. تطلب عبر واتساب
                وتدفع عند الاستلام.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {reserveHref ? (
                  <Button asChild size="lg" className="h-14 text-base">
                    <a href={reserveHref} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="size-5" aria-hidden="true" />
                      اطلب عبر واتساب
                    </a>
                  </Button>
                ) : null}
                <Button asChild size="lg" variant="outline" className="h-14 text-base">
                  <a href={`tel:+${BUSINESS_PHONE_E164}`}>
                    <Phone className="size-5" aria-hidden="true" /> <PhoneNumber />
                  </a>
                </Button>
              </div>

              <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                {[
                  "الدفع عند الاستلام",
                  "تأكيد الطلب بمكالمة هاتفية",
                  "توصيل مجاني ابتداءً من 200 د.ت",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 2 · Deux offres */}
        <section aria-labelledby="offres" className="container-page py-12">
          <h2 id="offres" className="text-2xl font-semibold">
            طريقتان للطلب
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {AR_DIABETES_OFFERS.map((offer) => {
              const Icon = offer.id === "abonnement-insuline" ? CalendarClock : Truck;
              const href = whatsappLink(offer.whatsappMessage);
              return (
                <article
                  key={offer.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6"
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
                        <span className="shrink-0 font-semibold tabular-nums" dir="ltr">
                          × {line.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    {offer.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  {href ? (
                    <Button asChild size="lg" className="mt-5 h-12">
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="size-5" aria-hidden="true" /> اطلب هذه الباقة
                      </a>
                    </Button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        {/* 3 · Comment ça marche */}
        <section aria-labelledby="etapes" className="border-y border-border bg-surface py-12">
          <div className="container-page">
            <h2 id="etapes" className="text-2xl font-semibold">
              كيف يعمل؟
            </h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {AR_DIABETES_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4 · FAQ, réponses dans le HTML */}
        <section aria-labelledby="faq" className="container-page py-12">
          <h2 id="faq" className="text-2xl font-semibold">
            أسئلة شائعة
          </h2>
          <div className="mt-4 max-w-3xl divide-y divide-border border-y border-border">
            {AR_DIABETES_FAQ.map((entry) => (
              <details key={entry.question} className="py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center font-medium marker:hidden">
                  {entry.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="container-page flex flex-col gap-2 py-8 text-sm text-muted-foreground">
          <p>مستلزمات السكري، توصيل إلى كامل تونس، الدفع عند الاستلام.</p>
          <a
            href={`tel:+${BUSINESS_PHONE_E164}`}
            className="inline-flex min-h-11 items-center gap-2"
          >
            <Phone className="size-4 text-primary" aria-hidden="true" /> <PhoneNumber />
          </a>
          <a
            href={`mailto:${BUSINESS_EMAIL}`}
            className="inline-flex min-h-11 items-center"
            dir="ltr"
          >
            {BUSINESS_EMAIL}
          </a>
          <Link to="/" lang="fr" className="inline-flex min-h-11 items-center">
            Version française
          </Link>
        </div>
      </footer>
    </div>
  );
}
