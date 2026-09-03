import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Réinitialiser le mot de passe — BA Medical Store" },
      {
        name: "description",
        content:
          "Définissez un nouveau mot de passe pour votre compte BA Medical Store.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const prepareRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;

      if (sessionError) {
        setError("Le lien de réinitialisation est invalide ou a expiré.");
        return;
      }

      if (data.session) {
        setReady(true);
        return;
      }

      setError(
        "Le lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien.",
      );
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
        setError(null);
      }
    });

    void prepareRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setMessage(
        "Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.",
      );
      setNewPassword("");
      setConfirmPassword("");
      await supabase.auth.signOut();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Impossible de réinitialiser le mot de passe.",
      );
    } finally {
      setBusy(false);
    }
  };

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
            <h1 className="text-xl font-bold">Nouveau mot de passe</h1>
            <p className="text-sm text-muted-foreground">
              Choisissez un nouveau mot de passe pour sécuriser votre compte.
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

          {ready && !message ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2"
                />
              </div>
              <Button type="submit" size="lg" width="full" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : null}
                Réinitialiser le mot de passe
              </Button>
            </form>
          ) : null}

          {message ? (
            <Link
              to="/auth"
              className="mt-5 block text-center text-sm text-primary hover:underline"
            >
              Retour à la connexion
            </Link>
          ) : null}
        </Card>
      </div>
    </SiteLayout>
  );
}
