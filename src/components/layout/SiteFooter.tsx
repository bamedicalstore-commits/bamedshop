import { Link } from "@tanstack/react-router";
import { MessageCircle, MapPin, Mail, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, BRANDS, FOOTER_LINKS } from "@/constants/navigation";

export function SiteFooter() {
  const phone = ((import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE ?? "") as string).replace(/\D/g, "");
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent("Bonjour BA Medical Store, je souhaite obtenir des informations.")}`
    : null;

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:py-14">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5"
            aria-label="BA Medical Store, accueil"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-[18px]" />
            </span>
            <span className="text-base font-bold tracking-[-0.02em]">BA Medical Store</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Matériel médical et équipements de santé pour les professionnels et les particuliers en
            Tunisie.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              Tunisie
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5 text-primary" />
              Contact en ligne
            </span>
          </div>
          {whatsappHref ? (
            <Button asChild size="sm" className="mt-5">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle />
                WhatsApp Business
              </a>
            </Button>
          ) : null}
        </div>

        <FooterColumn title="Catalogue">
          {CATEGORIES.slice(0, 6).map((c) => (
            <li key={c.slug}>
              <Link
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {b.name}
              </Link>
            </li>
          ))}
        </FooterColumn>
        <FooterColumn title="Service">
          {FOOTER_LINKS.service.slice(0, 5).map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </FooterColumn>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} BA Medical Store. Tous droits réservés.</span>
          <div className="flex flex-wrap gap-4">
            {FOOTER_LINKS.legal.map((l) => (
              <Link key={l.label} to={l.to} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {title}
      </h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}
