import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Commande — BA Medical Store" },
      { name: "description", content: "Finalisez votre commande en toute sécurité." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <SiteLayout>
      <div className="container-page py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Commande</h1>

        <ol className="mt-6 flex items-center gap-2 text-sm">
          <Step n={1} label="Livraison" active />
          <span className="h-px flex-1 bg-border" />
          <Step n={2} label="Paiement" />
          <span className="h-px flex-1 bg-border" />
          <Step n={3} label="Confirmation" />
        </ol>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="size-5 text-primary" aria-hidden="true" /> Adresse de livraison
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="firstName" label="Prénom" required />
                <Field id="lastName" label="Nom" required />
                <Field id="email" label="Email" type="email" required />
                <Field id="phone" label="Téléphone" type="tel" required />
                <Field id="address" label="Adresse" required className="sm:col-span-2" />
                <Field id="city" label="Ville" required />
                <Field id="zip" label="Code postal" required />
              </div>
              <div className="mt-4">
                <Label htmlFor="notes">Instructions de livraison (optionnel)</Label>
                <Textarea id="notes" className="mt-2" rows={3} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Truck className="size-5 text-primary" aria-hidden="true" /> Mode de livraison
              </h2>
              <RadioGroup defaultValue="standard" className="mt-4 space-y-3">
                <ShippingOption id="standard" label="Standard (24-48h)" price="8.000 DT" />
                <ShippingOption id="express" label="Express (24h)" price="15.000 DT" />
                <ShippingOption id="pickup" label="Retrait en magasin" price="Gratuit" />
              </RadioGroup>
            </Card>

            <Card className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <CreditCard className="size-5 text-primary" aria-hidden="true" /> Paiement
              </h2>
              <RadioGroup defaultValue="card" className="mt-4 space-y-3">
                <PayOption id="card" label="Carte bancaire (Konnect / Flouci)" />
                <PayOption id="cod" label="Paiement à la livraison" />
                <PayOption id="wire" label="Virement bancaire" />
              </RadioGroup>
            </Card>
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Récapitulatif</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Articles (2)" value="368.000 DT" />
                <Row label="Livraison" value="8.000 DT" />
              </dl>
              <Separator className="my-4" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total TTC</span>
                <span className="text-2xl font-bold tracking-tight">376.000 DT</span>
              </div>
              <Button type="submit" size="lg" width="full" className="mt-6">
                Confirmer et payer
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Paiement 100% sécurisé
              </p>
              <Button asChild variant="ghost" width="full" className="mt-2">
                <Link to="/cart">Modifier mon panier</Link>
              </Button>
            </Card>
          </aside>
        </form>
      </div>
    </SiteLayout>
  );
}

function Step({ n, label, active }: { n: number; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          active
            ? "grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
            : "grid size-7 place-items-center rounded-full border border-border text-xs font-bold text-muted-foreground"
        }
      >
        {n}
      </span>
      <span className={active ? "font-semibold" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  className,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input id={id} type={type} required={required} className="mt-2" />
    </div>
  );
}

function ShippingOption({ id, label, price }: { id: string; label: string; price: string }) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-md border border-input p-4 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
    >
      <RadioGroupItem value={id} id={id} />
      <span className="flex-1 font-medium">{label}</span>
      <span className="text-sm font-semibold">{price}</span>
    </Label>
  );
}

function PayOption({ id, label }: { id: string; label: string }) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-md border border-input p-4 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
    >
      <RadioGroupItem value={id} id={id} />
      <span className="font-medium">{label}</span>
    </Label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
