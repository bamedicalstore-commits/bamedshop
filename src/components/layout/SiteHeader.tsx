import { Link, useRouterState } from "@tanstack/react-router";
import { HeartPulse, Menu, MessageCircle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MAIN_NAV } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_E164, whatsappLink } from "@/lib/site";

/*
 * En-tête — refonte UX « fiable puis clair ».
 * Seulement des pages réelles. L'action principale (WhatsApp) reste toujours
 * visible ; le panier, la recherche, la comparaison et la liste d'envies
 * reviendront quand les produits auront un prix de vente validé.
 * Cibles tactiles ≥ 44 px.
 */

const WHATSAPP_MESSAGE = "Bonjour BA Medical Store, j'ai une question.";

export function SiteHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const whatsappHref = whatsappLink(WHATSAPP_MESSAGE);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-2 lg:h-20">
        {/* Menu mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[86%] max-w-sm p-0">
            <SheetHeader className="border-b p-5">
              <SheetTitle className="flex items-center gap-2">
                <HeartPulse className="size-5 text-primary" aria-hidden="true" />
                BA Medical Store
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-2" aria-label="Navigation principale">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-11 items-center rounded-md px-3 text-base font-medium text-foreground hover:bg-accent",
                    pathname === item.to && "bg-primary-soft text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 grid gap-2 border-t p-4">
              {whatsappHref ? (
                <Button asChild size="lg" className="h-12">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-5" aria-hidden="true" /> Écrire sur WhatsApp
                  </a>
                </Button>
              ) : null}
              <Button asChild size="lg" variant="outline" className="h-12">
                <a href={`tel:+${BUSINESS_PHONE_E164}`}>
                  <Phone className="size-5" aria-hidden="true" /> {BUSINESS_PHONE_DISPLAY}
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          to="/"
          className="flex min-h-11 shrink-0 items-center gap-2"
          aria-label="BA Medical Store, accueil"
        >
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-brand)]">
            <HeartPulse className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-foreground">BA Medical</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Store
            </span>
          </div>
        </Link>

        {/* Navigation bureau */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                pathname === item.to && "text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/ar"
            lang="ar"
            className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            العربية
          </Link>
          <a
            href={`tel:+${BUSINESS_PHONE_E164}`}
            className="hidden min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground xl:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {BUSINESS_PHONE_DISPLAY}
          </a>
          <Button variant="ghost" size="icon" className="size-11" aria-label="Mon compte" asChild>
            <Link to="/auth">
              <User />
            </Link>
          </Button>
          {whatsappHref ? (
            <Button asChild className="h-11 min-w-11 px-3 sm:px-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Commander sur WhatsApp"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                <span className="hidden sm:inline">Commander</span>
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
