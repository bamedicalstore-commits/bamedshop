import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/account/documents")({
  head: () => ({ meta: [{ title: "Mes documents" }, { name: "robots", content: "noindex" }] }),
  component: DocumentsPage,
});

const DOCS = [
  { name: "Facture CMD-2025-00147", type: "PDF", date: "10 mars 2025", size: "128 Ko" },
  { name: "Facture CMD-2025-00098", type: "PDF", date: "22 fév. 2025", size: "112 Ko" },
  { name: "Certificat de garantie — Omron M3", type: "PDF", date: "10 mars 2025", size: "84 Ko" },
  { name: "Bon de livraison CMD-2025-00042", type: "PDF", date: "05 fév. 2025", size: "56 Ko" },
];

function DocumentsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Mes documents</h2>
      <p className="mt-1 text-sm text-muted-foreground">Factures, bons de livraison, certificats.</p>
      <ul className="mt-6 divide-y divide-border">
        {DOCS.map((d) => (
          <li key={d.name} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-accent text-muted-foreground">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.type} · {d.date} · {d.size}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="size-4" aria-hidden="true" /> Télécharger
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
