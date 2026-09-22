import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, UserRound, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MAIN_NAV, CATEGORIES } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { SmartSearchTrigger, SmartSearchIconTrigger } from "@/components/ecommerce/SmartSearch";
import { MegaMenu } from "./MegaMenu";

export function SiteHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3 lg:h-[4.5rem]">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88%] max-w-sm p-0">
            <SheetHeader className="border-b p-5">
              <SheetTitle className="flex items-center gap-2">
                <HeartPulse className="size-5 text-primary" />
                BA Medical Store
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-3">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === item.to && "bg-primary-soft text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 border-t px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Catégories
              </div>
              {CATEGORIES.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-accent"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="BA Medical Store, accueil"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-brand)] transition-transform duration-300 group-hover:scale-[1.03]">
            <HeartPulse className="size-[18px]" />
          </div>
          <div className="hidden leading-none sm:block">
            <span className="block text-[15px] font-bold tracking-[-0.02em] text-foreground">
              BA Medical
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Store
            </span>
          </div>
        </Link>

        <div className="ml-3 hidden min-w-0 max-w-2xl flex-1 md:flex">
          <SmartSearchTrigger />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="md:hidden">
            <SmartSearchIconTrigger />
          </div>
          <Button asChild variant="ghost" size="icon" aria-label="Mon compte">
            <Link to="/auth">
              <UserRound />
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="ml-1 hidden sm:inline-flex">
            <Link to="/catalogue">
              <Search /> Catalogue
            </Link>
          </Button>
        </div>
      </div>
      <nav
        className="hidden border-t border-border/70 bg-background lg:block"
        aria-label="Navigation principale"
      >
        <div className="container-page flex h-11 items-center">
          <MegaMenu />
        </div>
      </nav>
    </header>
  );
}
