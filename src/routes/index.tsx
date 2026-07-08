import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, HeartHandshake, Sparkles, Search } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { FeatureCard } from "@/components/common/FeatureCard";
import { CategoryCard } from "@/components/ecommerce/CategoryCard";
import { BrandCard } from "@/components/ecommerce/BrandCard";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { CATEGORIES, BRANDS, MOCK_PRODUCTS } from "@/constants/navigation";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-soft/60 to-background">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="space-y-6">
            <Badge variant="soft" className="w-fit">
              <Sparkles aria-hidden="true" /> Nouveau · Catalogue Pharmatec en ligne
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Matériel médical <span className="text-primary">professionnel</span>, livré partout en Tunisie.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Dispositifs, consommables et mobilier certifiés pour médecins, cliniques, infirmiers,
              kinés et particuliers. Sélection experte, prix pros, service premium.
            </p>
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="flex max-w-lg gap-2"
            >
              <label htmlFor="hero-search" className="sr-only">
                Rechercher un produit
              </label>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="hero-search"
                  type="search"
                  placeholder="Tensiomètre, oxymètre, seringues…"
                  className="h-12 pl-10"
                />
              </div>
              <Button type="submit" size="lg">
                Rechercher
              </Button>
            </form>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/catalogue">
                  Voir le catalogue <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Devis professionnel</Link>
              </Button>
            </div>
          </div>
          <div
            className="relative hidden aspect-[4/5] w-full rounded-3xl bg-gradient-to-br from-primary/20 to-info-soft lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-4 rounded-2xl border border-border/60 bg-background/60 backdrop-blur-sm" />
            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
              <div className="flex-1 surface-card px-4 py-3">
                <p className="text-xs text-muted-foreground">Notes vérifiées</p>
                <p className="text-lg font-bold">4.8/5</p>
              </div>
              <div className="flex-1 surface-card px-4 py-3">
                <p className="text-xs text-muted-foreground">Références</p>
                <p className="text-lg font-bold">2 500+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={ShieldCheck} title="Produits certifiés" description="Dispositifs CE et normes internationales, traçabilité complète." />
          <FeatureCard icon={Truck} title="Livraison rapide" description="Expédition sous 24h en Tunisie, offerte dès 200 DT." />
          <FeatureCard icon={HeartHandshake} title="Support pro" description="Conseillers médicaux dédiés B2B pour cabinets et cliniques." />
          <FeatureCard icon={Sparkles} title="Prix professionnels" description="Tarifs dégressifs et abonnement BA Medical+ pour économiser." />
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-14">
        <SectionHeader
          eyebrow="Explorer"
          title="Nos catégories"
          description="Une gamme complète pour équiper votre pratique."
          actionLabel="Toutes les catégories"
          actionTo="/categories"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 8).map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Best-sellers */}
      <section className="container-page py-14">
        <SectionHeader
          eyebrow="Populaires"
          title="Best-sellers"
          description="Les produits préférés des professionnels."
          actionLabel="Tout le catalogue"
          actionTo="/catalogue"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_PRODUCTS.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="border-t border-border bg-surface py-14">
        <div className="container-page">
          <SectionHeader
            eyebrow="Nos partenaires"
            title="Marques référentes"
            actionLabel="Toutes les marques"
            actionTo="/brands"
          />
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {BRANDS.map((b) => (
              <BrandCard key={b.slug} brand={b} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA B2B */}
      <section className="container-page py-14">
        <div className="surface-elevated grid gap-6 overflow-hidden rounded-2xl p-8 md:grid-cols-2 md:items-center md:p-12">
          <div className="space-y-3">
            <Badge variant="info">Professionnels</Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Un compte pro pour votre cabinet, votre clinique ou votre entreprise
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Tarifs négociés, devis instantanés, facturation TVA, commandes récurrentes et
              interlocuteur dédié.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild size="lg">
              <Link to="/contact">Demander un compte pro</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/faq">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
