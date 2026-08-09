import { ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";

const PILLARS = [
  { icon: ShieldCheck, title: "Qualité médicale", text: "Sourcing exclusif chez fabricants certifiés CE, ISO 13485 et FDA." },
  { icon: Sparkles, title: "Innovation continue", text: "Veille technologique permanente pour rester à la pointe du matériel médical." },
  { icon: Users, title: "Proximité humaine", text: "Une équipe de conseillers médicaux à votre écoute, du particulier à la clinique." },
];

export function BrandStory() {
  return (
    <section aria-labelledby="brand-story" className="container-page py-14">
      <SectionHeader
        eyebrow="Pourquoi BA Medical Store"
        title="La santé mérite mieux qu'un e-commerce ordinaire"
        description="Depuis notre création, nous construisons la plateforme de référence du matériel médical en Tunisie, pensée pour les soignants et leurs patients."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <p.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
