import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/account/warranties")({
  head: () => ({ meta: [{ title: "Mes garanties" }, { name: "robots", content: "noindex" }] }),
  component: WarrantiesPage,
});

const WARRANTIES = [
  { product: "Tensiomètre Omron M3", ref: "CMD-2025-00147", expiresAt: "10 mars 2027", status: "active" },
  { product: "Stéthoscope Littmann Classic III", ref: "CMD-2024-01102", expiresAt: "18 déc. 2026", status: "active" },
  { product: "Oxymètre Pro", ref: "CMD-2024-00812", expiresAt: "05 sept. 2025", status: "expired" },
];

function WarrantiesPage() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Mes garanties</h2>
      <p className="mt-1 text-sm text-muted-foreground">Suivi des garanties actives et échues.</p>
      <ul className="mt-6 space-y-3">
        {WARRANTIES.map((w) => (
          <li key={w.ref} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{w.product}</p>
                <p className="text-xs text-muted-foreground">{w.ref} · Expire le {w.expiresAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={w.status === "active" ? "success" : "outline"}>
                {w.status === "active" ? "Active" : "Expirée"}
              </Badge>
              <Button variant="outline" size="sm">Détails</Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
