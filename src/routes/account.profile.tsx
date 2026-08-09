import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/profile")({
  head: () => ({ meta: [{ title: "Mon profil" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Informations personnelles</h2>
        <form onSubmit={(e) => e.preventDefault()} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-first">Prénom</Label>
            <Input id="p-first" defaultValue="Ahmed" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="p-last">Nom</Label>
            <Input id="p-last" defaultValue="Ben Ali" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="p-email">Email</Label>
            <Input id="p-email" type="email" defaultValue="ahmed@example.com" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="p-phone">Téléphone</Label>
            <Input id="p-phone" type="tel" defaultValue="+216 55 555 555" className="mt-2" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Sécurité</h2>
        <form onSubmit={(e) => e.preventDefault()} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-old">Mot de passe actuel</Label>
            <Input id="p-old" type="password" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="p-new">Nouveau mot de passe</Label>
            <Input id="p-new" type="password" className="mt-2" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="outline">
              Mettre à jour
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
