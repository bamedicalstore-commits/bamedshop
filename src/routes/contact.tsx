import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  absoluteUrl,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  SITE_NAME,
  whatsappLink,
} from "@/lib/site";

/*
 * Contact — sans formulaire.
 * L'ancien formulaire n'envoyait rien (preventDefault) : chaque message était
 * perdu. Trois canaux réels, du plus rapide au plus lent. Pas de délai de
 * réponse promis tant qu'il n'est pas mesuré.
 */

const TITLE = "Contact";
const DESCRIPTION =
  "Contactez BA Medical Store sur WhatsApp, par téléphone au +216 24 56 26 60 ou par e-mail.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `${TITLE} — ${SITE_NAME}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `${TITLE} — ${SITE_NAME}` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/contact") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const whatsappHref = whatsappLink("Bonjour BA Medical Store, j'ai une question.");

  const channels = [
    whatsappHref
      ? {
          href: whatsappHref,
          external: true,
          Icon: MessageCircle,
          title: "WhatsApp",
          detail: "Le plus rapide pour commander ou poser une question.",
          value: BUSINESS_PHONE_DISPLAY,
        }
      : null,
    {
      href: `tel:+${BUSINESS_PHONE_E164}`,
      external: false,
      Icon: Phone,
      title: "Téléphone",
      detail: "Pour être conseillé de vive voix.",
      value: BUSINESS_PHONE_DISPLAY,
    },
    {
      href: `mailto:${BUSINESS_EMAIL}`,
      external: false,
      Icon: Mail,
      title: "E-mail",
      detail: "Pour les demandes qui ne sont pas urgentes.",
      value: BUSINESS_EMAIL,
    },
  ].filter((c) => c !== null);

  return (
    <SiteLayout>
      <div className="container-page py-12">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{TITLE}</h1>
          <p className="mt-3 text-muted-foreground">
            Une question sur un produit, une commande ou un abonnement ? Choisissez le canal qui
            vous convient.
          </p>
        </header>

        <ul className="mt-8 grid max-w-3xl gap-4">
          {channels.map(({ href, external, Icon, title, detail, value }) => (
            <li key={title}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex min-h-11 items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-muted-foreground">{detail}</span>
                  <span className="mt-1 block truncate font-medium text-primary">{value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </SiteLayout>
  );
}
