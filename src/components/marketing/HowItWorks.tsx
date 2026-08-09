import { Search, ShoppingCart, Truck, HeartHandshake } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";

const STEPS = [
  { icon: Search, title: "Choisissez", description: "Explorez 2500+ références certifiées, filtrées par spécialité." },
  { icon: ShoppingCart, title: "Commandez", description: "Paiement sécurisé, devis pro en ligne, tarifs dégressifs." },
  { icon: Truck, title: "Recevez", description: "Livraison 24-48h partout en Tunisie, offerte dès 200 DT." },
  { icon: HeartHandshake, title: "Utilisez sereinement", description: "Support pro dédié, garantie constructeur, retours 14 jours." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="container-page py-14">
      <SectionHeader
        eyebrow="Simple & rapide"
        title="Comment ça fonctionne"
        description="Quatre étapes pour équiper votre pratique ou votre foyer."
      />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <s.icon className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
