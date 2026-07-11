import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/account/addresses")({
  head: () => ({ meta: [{ title: "Mes adresses" }, { name: "robots", content: "noindex" }] }),
  component: AddressesPage,
});

const ADDRESSES = [
  { id: "a1", label: "Domicile", name: "Ahmed Ben Ali", street: "12 rue Ibn Khaldoun", city: "Tunis 1002", phone: "+216 55 555 555", default: true },
  { id: "a2", label: "Cabinet", name: "Dr Ahmed Ben Ali", street: "Immeuble Med Center, Av. H. Bourguiba", city: "Sfax 3000", phone: "+216 74 111 222", default: false },
];

function AddressesPage() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mes adresses</h2>
        <Button size="sm"><Plus className="size-4" aria-hidden="true" /> Ajouter</Button>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {ADDRESSES.map((a) => (
          <li key={a.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold">{a.label}</span>
                {a.default && <Badge variant="soft">Par défaut</Badge>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Modifier"><Pencil className="size-4" aria-hidden="true" /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Supprimer"><Trash2 className="size-4" aria-hidden="true" /></Button>
              </div>
            </div>
            <div className="mt-3 space-y-0.5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{a.name}</p>
              <p>{a.street}</p>
              <p>{a.city}</p>
              <p>{a.phone}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
