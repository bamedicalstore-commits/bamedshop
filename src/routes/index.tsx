import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, HeartHandshake, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { FeatureCard } from "@/components/common/FeatureCard";
import { CategoryCard } from "@/components/ecommerce/CategoryCard";
import { BrandCard } from "@/components/ecommerce/BrandCard";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { SmartSearchTrigger } from "@/components/ecommerce/SmartSearch";
import { MedicalProductFinder } from "@/components/ecommerce/MedicalProductFinder";
import { TrustSection } from "@/components/marketing/TrustSection";
import { MedicalPlusCard } from "@/components/marketing/MedicalPlusCard";
import { B2BBanner } from "@/components/marketing/B2BBanner";
import { BrandStory } from "@/components/marketing/BrandStory";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { HealthPacksGrid } from "@/components/marketing/HealthPacksGrid";
import { ReviewsSection } from "@/components/marketing/ReviewsSection";
import { BlogTeaser } from "@/components/marketing/BlogTeaser";
import { FaqTeaser } from "@/components/marketing/FaqTeaser";
import { NewsletterSection } from "@/components/marketing/NewsletterSection";
import { CATEGORIES, BRANDS, MOCK_PRODUCTS } from "@/constants/navigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BA Medical Store — Matériel médical certifié en Tunisie" },
      { name: "description", content: "Distributeur premium de matériel médical en Tunisie : diagnostic, consommables, mobilier, orthopédie. Marques certifiées CE, livraison 24-48h, tarifs professionnels." },
      { property: "og:title", content: "BA Medical Store — Matériel médical certifié en Tunisie" },
      { property: "og:description", content: "Distributeur premium de matériel médical en Tunisie : diagnostic, consommables, mobilier, orthopédie. Marques certifiées CE, livraison 24-48h, tarifs professionnels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-soft/60 to-background">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="animate-fade-in space-y-6">
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
            <div className="max-w-lg"><SmartSearchTrigger /></div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/catalogue">Voir le catalogue <ArrowRight aria-hidden="true" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Devis professionnel</Link>
              </Button>
            </div>
            <dl className="grid max-w-md grid-cols-3 gap-4 pt-2">
              <div><dt className="text-xs text-muted-foreground">Références</dt><dd className="text-lg font-bold">2 500+</dd></div>
              <div><dt className="text-xs text-muted-foreground">Notes vérifiées</dt><dd className="text-lg font-bold">4.8/5</dd></div>
              <div><dt className="text-xs text-muted-foreground">Pros équipés</dt><dd className="text-lg font-bold">1 400+</dd></div>
            </dl>
          </div>
          <div className="relative hidden aspect-[4/5] w-full rounded-3xl bg-gradient-to-br from-primary/20 to-info-soft lg:block" aria-hidden="true">
            <div className="absolute inset-4 rounded-2xl border border-border/60 bg-background/60 backdrop-blur-sm" />
            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
              <div className="flex-1 surface-card px-4 py-3">
                <p className="text-xs text-muted-foreground">Livraison</p>
                <p className="text-lg font-bold">24-48h</p>
              </div>
              <div className="flex-1 surface-card px-4 py-3">
                <p className="text-xs text-muted-foreground">Certifiés CE</p>
                <p className="text-lg font-bold">100%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Réassurance rapide */}
      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={ShieldCheck} title="Produits certifiés" description="Dispositifs CE et normes internationales, traçabilité complète." />
          <FeatureCard icon={Truck} title="Livraison rapide" description="Expédition sous 24h en Tunisie, offerte dès 200 DT." />
          <FeatureCard icon={HeartHandshake} title="Support pro" description="Conseillers médicaux dédiés B2B pour cabinets et cliniques." />
          <FeatureCard icon={Sparkles} title="Prix professionnels" description="Tarifs dégressifs et abonnement BA Medical+ pour économiser." />
        </div>
      </section>

      {/* 1. Pourquoi BA Medical Store — brand story */}
      <BrandStory />

      {/* 2. Nos marques */}
      <section className="border-y border-border bg-surface py-14">
        <div className="container-page">
          <SectionHeader eyebrow="Nos partenaires" title="Marques référentes" actionLabel="Toutes les marques" actionTo="/brands" />
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {BRANDS.map((b) => <BrandCard key={b.slug} brand={b} />)}
          </div>
        </div>
      </section>

      {/* 3. Catégories */}
      <section className="container-page py-14">
        <SectionHeader eyebrow="Explorer" title="Nos catégories"
          description="Une gamme complète pour équiper votre pratique."
          actionLabel="Toutes les catégories" actionTo="/categories" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 8).map((c) => <CategoryCard key={c.slug} category={c} />)}
        </div>
      </section>

      {/* 4. Comment ça fonctionne */}
      <HowItWorks />

      {/* 5. Medical Product Finder */}
      <section className="container-page py-10">
        <MedicalProductFinder />
      </section>

      {/* 6. Produits populaires */}
      <section className="container-page py-14">
        <SectionHeader eyebrow="Populaires" title="Best-sellers"
          description="Les produits préférés des professionnels."
          actionLabel="Tout le catalogue" actionTo="/catalogue" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_PRODUCTS.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* 7. Packs santé */}
      <HealthPacksGrid limit={6} />

      {/* 8. BA Medical+ */}
      <section className="container-page py-14"><MedicalPlusCard /></section>

      {/* 9. Avis clients */}
      <ReviewsSection />

      {/* Trust long-form */}
      <section className="py-14"><TrustSection /></section>

      {/* 10. Blog santé */}
      <BlogTeaser />

      {/* B2B */}
      <section className="container-page py-14"><B2BBanner /></section>

      {/* 11. FAQ */}
      <FaqTeaser />

      {/* 12. Newsletter */}
      <NewsletterSection />
    </SiteLayout>
  );
}
