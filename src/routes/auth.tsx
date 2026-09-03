import { FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion & inscription — BA Medical Store" },
      {
        name: "description",
        content: "Connectez-vous ou créez votre compte BA Medical Store.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (authError) throw authError;
      setMessage("Connexion réussie. Redirection vers votre espace…");
      window.location.assign("/admin");
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Connexion impossible.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        recoveryEmail,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );
      if (authError) throw authError;
      setMessage(
        "Un lien de réinitialisation vient d’être envoyé à votre adresse e-mail.",
      );
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Impossible d’envoyer le lien de réinitialisation.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setBusy(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            first_name: registerFirstName,
            last_name: registerLastName,
          },
        },
      });
      if (authError) throw authError;
      setMessage(
        data.session
          ? "Compte créé. Vous êtes connecté."
          : "Compte créé. Vérifiez votre e-mail pour confirmer votre compte.",
      );
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Inscription impossible.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (forgotMode) {
    return (
      <SiteLayout>
        <div className="container-page grid min-h-[70dvh] place-items-center py-10">
          <Card className="w-full max-w-md p-6 sm:p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <div
              className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-brand)]"
            >
                <HeartPulse className="size-5" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold">Mot de passe oublié ?</h1>
              <p className="text-sm text-muted-foreground">
                Entrez votre adresse e-mail pour recevoir un lien de
                réinitialisation sécurisé.
              </p>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-5 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}
            {message ? (
              <div
                role="status"
                className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-primary"
              >
                {message}
              </div>
            ) : null}

            <form onSubmit={handlePasswordRecovery} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="recovery-email">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={recoveryEmail}
                  onChange={(event) => setRecoveryEmail(event.target.value)}
                  className="mt-2"
                />
              </div>
              <Button type="submit" size="lg" width="full" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : null}
                Envoyer le lien
              </Button>
              <Button
                type="button"
                variant="ghost"
                width="full"
                disabled={busy}
                onClick={() => {
                  clearFeedback();
                  setForgotMode(false);
                }}
              >
                Retour à la connexion
              </Button>
            </form>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page grid min-h-[70dvh] place-items-center py-10">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div
              className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-brand)]"
            >
              <HeartPulse className="size-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold">Bienvenue</h1>
            <p className="text-sm text-muted-foreground">
              Connectez-vous ou créez votre compte pour continuer.
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-5 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}
          {message ? (
            <div
              role="status"
              className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-primary"
            >
              {message}
            </div>
          ) : null}

          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        clearFeedback();
                        setRecoveryEmail(loginEmail);
                        setForgotMode(true);
                      }}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button type="submit" size="lg" width="full" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : null}
                  Se connecter
                </Button>
                <div className="relative py-2">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    ou
                  </span>
                </div>
                <Button type="button" variant="outline" width="full" disabled>
                  Continuer avec Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="reg-first">Prénom</Label>
                    <Input
                      id="reg-first"
                      required
                      value={registerFirstName}
                      onChange={(event) => setRegisterFirstName(event.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-last">Nom</Label>
                    <Input
                      id="reg-last"
                      required
                      value={registerLastName}
                      onChange={(event) => setRegisterLastName(event.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Checkbox id="cgv" className="mt-0.5" required />
                  <span>
                    J'accepte les{" "}
                    <a className="text-primary hover:underline" href="#">
                      conditions générales
                    </a>{" "}
                    et la{" "}
                    <a className="text-primary hover:underline" href="#">
                      politique de confidentialité
                    </a>
                    .
                  </span>
                </label>
                <Button type="submit" size="lg" width="full" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : null}
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </SiteLayout>
  );
}
