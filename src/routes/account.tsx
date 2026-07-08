import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { User, Package, Repeat, Heart, LogOut } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Mon compte — BA Medical Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

const LINKS = [
  { to: "/account", label: "Profil", icon: User, exact: true },
  { to: "/account/orders", label: "Mes commandes", icon: Package },
  { to: "/account/subscriptions", label: "Abonnements", icon: Repeat },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
] as const;

function AccountLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <SiteLayout>
      <div className="container-page py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mon compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bienvenue, gérez vos données et vos commandes.</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <Card className="p-2">
              <nav aria-label="Navigation compte" className="flex flex-col">
                {LINKS.map((l) => {
                  const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-soft text-primary"
                          : "text-foreground hover:bg-accent",
                      )}
                    >
                      <l.icon className="size-4" aria-hidden="true" /> {l.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <LogOut className="size-4" aria-hidden="true" /> Déconnexion
                </button>
              </nav>
            </Card>
          </aside>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
