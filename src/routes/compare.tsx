import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Printer, Share2, Download, Link2, Check, Scale } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriceBlock } from "@/components/ecommerce/PriceBlock";
import { AvailabilityBadge } from "@/components/ecommerce/AvailabilityBadge";
import { Rating } from "@/components/ecommerce/Rating";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useUiStore, uiActions } from "@/hooks/useUiStore";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Comparer les produits — BA Medical Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const items = useUiStore((s) => s.compare);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Comparaison produits", url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => window.print();

  return (
    <div className="container-page py-10 print:py-4">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Comparaison</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} produit{items.length > 1 ? "s" : ""} sélectionné
            {items.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download className="size-4" aria-hidden="true" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4" aria-hidden="true" /> Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="size-4" aria-hidden="true" /> Partager
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? (
              <Check className="size-4 text-success" aria-hidden="true" />
            ) : (
              <Link2 className="size-4" aria-hidden="true" />
            )}
            {copied ? "Copié" : "Lien"}
          </Button>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Aucun produit à comparer"
          description="Ajoutez des produits via le bouton Comparer sur les fiches produit."
        />
      ) : (
        <Card className="overflow-x-auto p-6">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `180px repeat(${items.length}, minmax(220px, 1fr))` }}
          >
            <Cell head>Produit</Cell>
            {items.map((p) => (
              <Cell key={p.id} className="font-semibold">
                {p.name}
              </Cell>
            ))}
            <Cell head>Marque</Cell>
            {items.map((p) => (
              <Cell key={p.id}>{p.brand}</Cell>
            ))}
            <Cell head>Prix</Cell>
            {items.map((p) => (
              <Cell key={p.id}>
                <PriceBlock price={p.price} compareAtPrice={p.compareAtPrice} />
              </Cell>
            ))}
            <Cell head>Disponibilité</Cell>
            {items.map((p) => (
              <Cell key={p.id}>
                <AvailabilityBadge status={p.availability} />
              </Cell>
            ))}
            <Cell head>Note</Cell>
            {items.map((p) => (
              <Cell key={p.id}>
                {p.rating ? <Rating value={p.rating} count={p.ratingCount} size="sm" /> : "—"}
              </Cell>
            ))}
            <Cell head>Garantie</Cell>
            {items.map((p) => (
              <Cell key={p.id}>{p.warrantyMonths ? `${p.warrantyMonths} mois` : "—"}</Cell>
            ))}
            <Cell head>Livraison</Cell>
            {items.map((p) => (
              <Cell key={p.id}>{p.deliveryEta ?? "—"}</Cell>
            ))}
            <Cell head>Ordonnance</Cell>
            {items.map((p) => (
              <Cell key={p.id}>{p.prescriptionRequired ? "Requise" : "Non"}</Cell>
            ))}
            <Cell head />
            {items.map((p) => (
              <Cell key={p.id}>
                <Button
                  size="sm"
                  className="w-full print:hidden"
                  onClick={() => addToCart(p)}
                  disabled={p.availability === "out_of_stock"}
                >
                  Ajouter
                </Button>
              </Cell>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Cell({
  children,
  head,
  className = "",
}: {
  children?: React.ReactNode;
  head?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`border-t border-border py-3 text-sm ${head ? "sticky left-0 bg-background text-xs font-semibold uppercase tracking-wide text-muted-foreground" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
