import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, Loader2, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  activateCatalogProduct,
  deactivateCatalogProduct,
  listCatalogActivationQueue,
  type CatalogActivationProduct,
  type CatalogActivationStatus,
} from "@/lib/catalog-activation-supabase";

export const Route = createFileRoute("/admin/catalog")({
  head: () => ({
    meta: [{ title: "Activation catalogue — BA Medical Store" }, { name: "robots", content: "noindex" }],
  }),
  component: CatalogActivationAdmin,
});

const STATUS_ORDER: CatalogActivationStatus[] = ["BLOCKED", "DRAFT", "REVIEW", "APPROVED", "ACTIVE"];

function CatalogActivationAdmin() {
  const [products, setProducts] = useState<CatalogActivationProduct[]>([]);
  const [status, setStatus] = useState<CatalogActivationStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await listCatalogActivationQueue());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => (status === "ALL" ? products : products.filter((product) => product.catalog_activation_status === status)),
    [products, status],
  );

  const counts = useMemo(
    () =>
      STATUS_ORDER.reduce<Record<string, number>>((acc, current) => {
        acc[current] = products.filter((product) => product.catalog_activation_status === current).length;
        return acc;
      }, {}),
    [products],
  );

  const activate = async (product: CatalogActivationProduct) => {
    setBusyId(product.id);
    setError(null);
    try {
      await activateCatalogProduct(product.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activation refusée par Supabase.");
    } finally {
      setBusyId(null);
    }
  };

  const deactivate = async (product: CatalogActivationProduct) => {
    setBusyId(product.id);
    setError(null);
    try {
      await deactivateCatalogProduct(product.id, "archived");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Désactivation refusée par Supabase.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" /> Supabase authority
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Activation catalogue</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Aucun produit ne devient retail-visible par simple présence en base. L’activation finale est décidée côté Supabase.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} /> Actualiser
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(["ALL", ...STATUS_ORDER] as const).map((item) => {
          const count = item === "ALL" ? products.length : counts[item];
          return (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                status === item ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item}</div>
              <div className="mt-1 text-2xl font-bold">{count ?? 0}</div>
            </button>
          );
        })}
      </div>

      {error ? (
        <Card className="border-destructive/40 bg-destructive/5 p-4">
          <div className="flex gap-3 text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="font-semibold">Action refusée</p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <LockKeyhole className="size-4 text-primary" aria-hidden="true" /> File d’activation retail
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Price + approval + media + copy + slug + produit actif sont vérifiés par la frontière database.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Chargement Supabase…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">Aucun produit dans cette vue.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((product) => (
              <ActivationRow
                key={product.id}
                product={product}
                busy={busyId === product.id}
                onActivate={() => void activate(product)}
                onDeactivate={() => void deactivate(product)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ActivationRow({
  product,
  busy,
  onActivate,
  onDeactivate,
}: {
  product: CatalogActivationProduct;
  busy: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const ready =
    product.retail_price_tnd !== null &&
    product.retail_price_tnd > 0 &&
    product.retail_price_approved &&
    product.media_approved &&
    product.copy_approved &&
    product.active &&
    Boolean(product.slug.trim());

  return (
    <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.8fr)_repeat(5,minmax(0,0.7fr))_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{product.name}</p>
          {product.catalog_activation_status === "ACTIVE" ? (
            <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Actif" />
          ) : null}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">/{product.slug}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {product.catalog_activation_reason ? `Motif: ${product.catalog_activation_reason}` : "Aucune décision enregistrée"}
        </p>
      </div>

      <Gate label="Prix" ok={product.retail_price_tnd !== null && product.retail_price_tnd > 0} />
      <Gate label="Prix approuvé" ok={product.retail_price_approved} />
      <Gate label="Media" ok={product.media_approved} />
      <Gate label="Copy" ok={product.copy_approved} />
      <Badge variant={statusVariant(product.catalog_activation_status)}>{product.catalog_activation_status}</Badge>

      <div className="flex gap-2 lg:justify-end">
        {product.catalog_activation_status === "ACTIVE" ? (
          <Button size="sm" variant="outline" onClick={onDeactivate} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Bloquer
          </Button>
        ) : (
          <Button size="sm" onClick={onActivate} disabled={busy || !ready} title={!ready ? "Les gates retail ne sont pas toutes validées." : undefined}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Activer
          </Button>
        )}
      </div>
    </div>
  );
}

function Gate({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`size-2 rounded-full ${ok ? "bg-success" : "bg-destructive"}`} aria-hidden="true" />
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function statusVariant(status: CatalogActivationStatus) {
  if (status === "ACTIVE") return "success" as const;
  if (status === "BLOCKED") return "destructive" as const;
  if (status === "APPROVED") return "info" as const;
  return "warning" as const;
}
