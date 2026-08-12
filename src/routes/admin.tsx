import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, HeartPulse, Bell, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administration — BA Medical Store" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

const NAV: ReadonlyArray<{
  to: "/admin" | "/admin/b2b" | "/admin/catalog";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { to: "/admin/catalog", label: "Activation catalogue", icon: ShieldCheck },
  { to: "/admin/b2b", label: "Comptes B2B", icon: Building2 },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="size-4" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">BA Medical</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
          </div>
        </div>
        <nav aria-label="Admin" className="flex flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input placeholder="Rechercher…" className="pl-10" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell />
              <Badge
                variant="destructive"
                size="sm"
                className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1"
              >
                3
              </Badge>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Voir le site</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
