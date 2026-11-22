import { Link } from "@tanstack/react-router";
import { HeartPulse, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { FOOTER_LINKS } from "@/constants/navigation";
import {
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  whatsappLink,
} from "@/lib/site";

/*
 * Pied de page — refonte UX « fiable puis clair ».
 * Retirés : formulaire newsletter (n'envoyait rien), liens sociaux vides,
 * catégories fictives, pages légales qui pointaient vers /contact.
 * Cibles tactiles ≥ 44 px.
 */

const SOLD_BRANDS = ["Bionime", "Sterilance", "Clickfine", "Rossmax"];

const DIABETES_LINKS = [
  { label: "Pack Diabète Démarrage", to: "/packs/diabete" as const },
  { label: "Abonnement Diabète Insuline", to: "/packs/diabete" as const },
  { label: "Tous nos produits", to: "/produits" as const },
];

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground";

export function SiteFooter() {
  const whatsappHref = whatsappLink("Bonjour BA Medical Store, j'ai une question.");

  return (
    <footer className="mt-16 border-t border-border bg-surface" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2"
            aria-label="BA Medical Store, accueil"
          >
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              BA Medical Store
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Consommables et matériel pour le diabète, livrés partout en Tunisie. Paiement à la
            livraison.
          </p>
          <ul className="mt-4 text-sm text-muted-foreground">
            <li className="flex min-h-11 items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Livraison partout en Tunisie
            </li>
            <li>
              <a href={`tel:+${BUSINESS_PHONE_E164}`} className={`${linkClass} gap-2`}>
                <Phone className="size-4 text-primary" aria-hidden="true" />
                {BUSINESS_PHONE_DISPLAY}
              </a>
            </li>
            {whatsappHref ? (
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} gap-2`}
                >
                  <MessageCircle className="size-4 text-primary" aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
            ) : null}
            <li>
              <a href={`mailto:${BUSINESS_EMAIL}`} className={`${linkClass} gap-2`}>
                <Mail className="size-4 text-primary" aria-hidden="true" />
                {BUSINESS_EMAIL}
              </a>
            </li>
          </ul>
        </div>

        <FooterColumn title="Diabète">
          {DIABETES_LINKS.map((l) => (
            <li key={l.label}>
              <Link to={l.to} className={linkClass}>
                {l.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Marques">
          {/* Marques réellement distribuées (via Pharmatec), sans page dédiée pour l'instant. */}
          {SOLD_BRANDS.map((name) => (
            <li key={name} className="flex min-h-11 items-center text-sm text-muted-foreground">
              {name}
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Aide">
          {FOOTER_LINKS.service.map((l) => (
            <li key={l.label}>
              <Link to={l.to} className={linkClass}>
                {l.label}
              </Link>
            </li>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-border">
        <div className="container-page py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} BA Medical Store. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <ul>{children}</ul>
    </div>
  );
}
