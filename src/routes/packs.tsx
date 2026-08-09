import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HealthPacksGrid } from "@/components/marketing/HealthPacksGrid";

export const Route = createFileRoute("/packs")({
  head: () => ({
    meta: [
      { title: "Packs santé — BA Medical Store" },
      {
        name: "description",
        content:
          "Sélections prêtes à l'emploi : Hypertension, Diabète, Bébé, Senior, Maintien à domicile, Cabinet médical.",
      },
    ],
  }),
  component: PacksLayout,
});

function PacksLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = pathname === "/packs" || pathname === "/packs/";
  return (
    <SiteLayout>
      {isRoot ? (
        <>
          <header className="container-page pt-10">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Packs santé</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Nos ensembles thématiques, sélectionnés par nos experts, à prix packagé.
            </p>
          </header>
          <HealthPacksGrid />
        </>
      ) : (
        <Outlet />
      )}
    </SiteLayout>
  );
}
