import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BA Medical Store" },
      {
        name: "description",
        content:
          "Contactez notre équipe pour toute question sur nos produits, un devis pro ou un partenariat.",
      },
      { property: "og:title", content: "Contact — BA Medical Store" },
      { property: "og:description", content: "Notre équipe répond sous 24h ouvrées." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <div className="container-page py-14">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
          <p className="mt-3 text-muted-foreground">
            Une question, un devis, un partenariat ? Notre équipe vous répond sous 24h ouvrées.
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Card className="p-6 sm:p-8">
            <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-first">Prénom</Label>
                <Input id="c-first" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="c-last">Nom</Label>
                <Input id="c-last" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="c-phone">Téléphone</Label>
                <Input id="c-phone" type="tel" className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-subject">Sujet</Label>
                <Input id="c-subject" required className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-message">Message</Label>
                <Textarea id="c-message" rows={6} required className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg">
                  Envoyer
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Nos coordonnées
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    Tunis, Tunisie
                    <br />
                    <span className="text-muted-foreground">Ouvert Lun-Ven 9h-18h</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href="tel:+21671000000" className="hover:text-primary">
                    +216 71 000 000
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href="mailto:contact@bamedical.tn" className="hover:text-primary">
                    contact@bamedical.tn
                  </a>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
