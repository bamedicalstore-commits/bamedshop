import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, HeartPulse } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES, BRANDS, FOOTER_LINKS } from "@/constants/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>

      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container-page grid gap-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recevez nos offres pros</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Nouveautés, promotions et guides d'achat pour professionnels de santé.
            </p>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Adresse email
            </label>
            <Input
              id="newsletter-email"
              type="email"
              required
              placeholder="votre@email.com"
              className="h-11"
            />
            <Button type="submit" size="lg">
              S'inscrire
            </Button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
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
            Plateforme e-commerce tunisienne de matériel médical certifié. Nous livrons
            particuliers, cabinets, cliniques et entreprises sur tout le territoire.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Tunis, Tunisie
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" aria-hidden="true" />
              +216 71 000 000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" aria-hidden="true" />
              contact@bamedical.tn
            </li>
          </ul>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" size="icon-sm" aria-label="Facebook" asChild>
              <a href="#" rel="noreferrer noopener"><Facebook /></a>
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Instagram" asChild>
              <a href="#" rel="noreferrer noopener"><Instagram /></a>
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="LinkedIn" asChild>
              <a href="#" rel="noreferrer noopener"><Linkedin /></a>
            </Button>
          </div>
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

        <FooterColumn title="Marques">
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

        <FooterColumn title="Service client">
          {FOOTER_LINKS.service.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {l.label}
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
