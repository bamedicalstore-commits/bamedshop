import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion & inscription — BA Medical Store" },
      { name: "description", content: "Connectez-vous ou créez votre compte BA Medical Store." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <SiteLayout>
      <div className="container-page grid min-h-[70dvh] place-items-center py-10">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-brand)]">
              <HeartPulse className="size-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold">Bienvenue</h1>
            <p className="text-sm text-muted-foreground">
              Connectez-vous ou créez un compte pour continuer.
            </p>
          </div>

          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" autoComplete="email" required className="mt-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Link to="/auth" className="text-xs text-primary hover:underline">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <Input id="login-password" type="password" autoComplete="current-password" required className="mt-2" />
                </div>
                <Button type="submit" size="lg" width="full">Se connecter</Button>
                <div className="relative py-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    ou
                  </span>
                </div>
                <Button type="button" variant="outline" width="full">Continuer avec Google</Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="reg-first">Prénom</Label>
                    <Input id="reg-first" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="reg-last">Nom</Label>
                    <Input id="reg-last" required className="mt-2" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" autoComplete="email" required className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <Input id="reg-password" type="password" autoComplete="new-password" required className="mt-2" />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Checkbox id="cgv" className="mt-0.5" required />
                  <span>
                    J'accepte les <a className="text-primary hover:underline" href="#">conditions générales</a> et la <a className="text-primary hover:underline" href="#">politique de confidentialité</a>.
                  </span>
                </label>
                <Button type="submit" size="lg" width="full">Créer mon compte</Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </SiteLayout>
  );
}
