import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section aria-labelledby="newsletter" className="container-page py-14">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/95 to-primary/80 p-8 text-primary-foreground sm:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-foreground/15">
            <Mail className="size-5" aria-hidden="true" />
          </span>
          <h2 id="newsletter" className="mt-4 text-2xl font-bold sm:text-3xl">
            Newsletter santé & offres pros
          </h2>
          <p className="mt-2 text-sm opacity-90">
            Conseils d'experts, nouveautés produits et promotions exclusives. Un email par mois, zéro spam.
          </p>
          {sent ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-sm">
              <Check className="size-4" aria-hidden="true" /> Merci ! Confirmez votre inscription par email.
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }}
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="nl-email" className="sr-only">Votre email</label>
              <Input
                id="nl-email"
                type="email"
                required
                placeholder="prenom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground text-foreground"
              />
              <Button type="submit" variant="secondary" className="shrink-0">S'inscrire</Button>
            </form>
          )}
          <p className="mt-3 text-xs opacity-75">Vous pouvez vous désinscrire à tout moment.</p>
        </div>
      </div>
    </section>
  );
}
