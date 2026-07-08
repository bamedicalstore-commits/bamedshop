import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Informations personnelles</h2>
      <form onSubmit={(e) => e.preventDefault()} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="p-first">Prénom</Label>
          <Input id="p-first" defaultValue="—" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="p-last">Nom</Label>
          <Input id="p-last" defaultValue="—" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="p-email">Email</Label>
          <Input id="p-email" type="email" defaultValue="—" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="p-phone">Téléphone</Label>
          <Input id="p-phone" type="tel" defaultValue="—" className="mt-2" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </Card>
  );
}
