import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { CATEGORIES, BRANDS } from "@/constants/navigation";

/**
 * Desktop mega menu — replaces the flat top nav on lg+.
 * Accessible via Radix NavigationMenu (keyboard + ARIA out of the box).
 */
export function MegaMenu() {
  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>
              Accueil
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Catégories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[720px] gap-6 p-6 md:grid-cols-[1fr_240px]">
              <ul className="grid grid-cols-2 gap-2" role="list">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/categories/$slug"
                        params={{ slug: c.slug }}
                        className="group block rounded-md p-3 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                            {c.name}
                          </span>
                          {c.productCount && (
                            <span className="text-[11px] text-muted-foreground">{c.productCount}</span>
                          )}
                        </div>
                        {c.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {c.description}
                          </p>
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
              <div className="rounded-lg bg-gradient-to-br from-primary-soft to-info-soft p-5">
                <Sparkles className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-bold text-foreground">Nouveau catalogue</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Plus de 2 500 références Pharmatec disponibles.
                </p>
                <Link
                  to="/catalogue"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Explorer <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Marques</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[520px] grid-cols-2 gap-2 p-4" role="list">
              {BRANDS.map((b) => (
                <li key={b.slug}>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/brands/$slug"
                      params={{ slug: b.slug }}
                      className="flex items-center justify-between rounded-md p-3 transition-colors hover:bg-accent"
                    >
                      <span className="text-sm font-medium">{b.name}</span>
                      {b.productCount && (
                        <span className="text-[11px] text-muted-foreground">{b.productCount}</span>
                      )}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {[
          { to: "/catalogue" as const, label: "Catalogue" },
          { to: "/blog" as const, label: "Blog" },
          { to: "/contact" as const, label: "Contact" },
        ].map((item) => (
          <NavigationMenuItem key={item.to}>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to={item.to} activeProps={{ className: "text-primary" }}>
                {item.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
