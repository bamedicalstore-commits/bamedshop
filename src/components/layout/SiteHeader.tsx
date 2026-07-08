import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, Heart, User, Phone, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_NAV, CATEGORIES } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3 lg:h-20">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
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
            <nav className="flex flex-col p-2">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent",
                    pathname === item.to && "bg-primary-soft text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 border-t px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Catégories
              </div>
              {CATEGORIES.slice(0, 6).map((c) => (
                <Link
                  key={c.slug}
                  to="/categories/$slug"
                  params={{ slug: c.slug }}
                  className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="BA Medical Store, accueil">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-brand)]">
            <HeartPulse className="size-5" aria-hidden="true" />
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-bold tracking-tight text-foreground">BA Medical</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Store
            </span>
          </div>
        </Link>

        {/* Search */}
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="ml-2 hidden max-w-2xl flex-1 items-center md:flex"
        >
          <label htmlFor="site-search" className="sr-only">
            Rechercher un produit
          </label>
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="site-search"
              type="search"
              placeholder="Rechercher un produit, une marque, une catégorie…"
              className="h-11 pl-10 pr-24"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2"
              aria-label="Lancer la recherche"
            >
              Rechercher
            </Button>
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Rechercher"
            asChild
          >
            <Link to="/search">
              <Search />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ma wishlist"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link to="/account/wishlist">
              <Heart />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Mon compte" asChild>
            <Link to="/auth">
              <User />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Panier" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart />
              <Badge
                variant="default"
                size="sm"
                className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1"
                aria-hidden="true"
              >
                0
              </Badge>
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav
        className="hidden border-t border-border bg-surface lg:block"
        aria-label="Navigation principale"
      >
        <div className="container-page flex h-11 items-center gap-1">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                pathname === item.to && "text-primary",
              )}
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3.5" aria-hidden="true" />
            +216 71 000 000
          </span>
        </div>
      </nav>
    </header>
  );
}
