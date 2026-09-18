import { Link } from "@tanstack/react-router";
import { HeartPulse, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, BRANDS, FOOTER_LINKS } from "@/constants/navigation";

export function SiteFooter() {
  const phone = ((import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE ?? "") as string).replace(/\D/g, "");
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent("Bonjour BA Medical Store, je souhaite obtenir des informations sur vos produits.")}`
    : null;

  return (
    <footer className="mt-16 border-t border-border bg-surface" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2" aria-label="BA Medical Store, accueil">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              BA Medical Store
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Matériel médical et équipements de santé pour les professionnels et les particuliers en Tunisie.
            Découvrez le catalogue en ligne et commandez directement avec notre équipe sur WhatsApp.
          </p>
          {whatsappHref ? (
            <Button asChild className="mt-5">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                Nous contacter sur WhatsApp
              </a>
            </Button>
          ) : null}
        </div>

        <FooterColumn title="Catégories">
          {CATEGORIES.slice(0, 6).map((c) => (
            <li key={c.slug}>
              <Link
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Service">
          {FOOTER_LINKS.service.slice(0, 3).map((l) => (
            <li key={l.label}>
              <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/catalogue" className="text-sm text-muted-foreground hover:text-foreground">
              Voir le catalogue
            </Link>
          </li>
          <li>
            <span className="text-sm text-muted-foreground">Livraison partout en Tunisie</span>
          </li>
        </FooterColumn>

        <FooterColumn title="Nos marques">
          {BRANDS.slice(0, 6).map((b) => (
            <li key={b.slug}>
              <Link
                to="/brands/$slug"
                params={{ slug: b.slug }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {b.name}
              </Link>
            </li>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} BA Medical Store. Tous droits réservés.</span>
          <ul className="flex flex-wrap gap-4">
            {FOOTER_LINKS.legal.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}
