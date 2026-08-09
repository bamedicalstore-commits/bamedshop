import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { MedicalAdvisor } from "@/components/ecommerce/MedicalAdvisor";
import { MedicalProductFinder } from "@/components/ecommerce/MedicalProductFinder";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Medical Advisor — BA Medical Store" },
      {
        name: "description",
        content:
          "Assistant personnalisé pour matériel médical selon votre profil : particulier, médecin, infirmier, clinique, pharmacie.",
      },
    ],
  }),
  component: AdvisorPage,
});

function AdvisorPage() {
  return (
    <SiteLayout>
      <div className="container-page space-y-10 py-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Medical Advisor</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Indiquez votre profil pour recevoir des recommandations personnalisées. Vos préférences
            sont mémorisées sur votre navigateur.
          </p>
        </header>
        <MedicalAdvisor />
        <MedicalProductFinder />
      </div>
    </SiteLayout>
  );
}
