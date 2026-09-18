import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, HeartHandshake, MessageCircle, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/common/SectionHeader";
import { FeatureCard } from "@/components/common/FeatureCard";
import { CategoryCard } from "@/components/ecommerce/CategoryCard";
import { BrandCard } from "@/components/ecommerce/BrandCard";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProductGridSkeleton } from "@/components/feedback/Skeletons";
import { listPublicProducts } from "@/lib/catalog.functions";
import { toProduct } from "@/lib/mappers";
import { CATEGORIES, BRANDS } from "@/constants/navigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BA Medical Store — Matériel médical en Tunisie" },
      {
        name: "description",
        content:
          "BA Medical Store propose du matériel médical et des équipements de santé pour professionnels et particuliers en Tunisie.",
      },
      { property: "og:title", content: "BA Medical Store — Matériel médical en Tunisie" },
      {
        property: "og:description",
        content:
          "Découvrez notre sélection de matériel médical et commandez directement avec BA Medical Store.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              BA Medical Store
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
              Le matériel médical, simplement.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Une sélection de matériel médical et d’équipements de santé pour les professionnels
              comme pour les particuliers, avec un accompagnement direct par notre équipe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/catalogue">
                  Explorer le catalogue <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">
                  <MessageCircle aria-hidden="true" /> Nous contacter
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Commande confirmée directement avec notre équipe sur WhatsApp.
            </p>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-border bg-background shadow-[var(--shadow-soft)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,var(--primary-soft),transparent_48%)]" />
            <div className="relative flex h-full min-h-[360px] flex-col justify-end p-6 sm:p-8">
              <div className="max-w-sm rounded-2xl border border-border/80 bg-background/90 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Votre sélection
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight">
                  Des produits choisis pour la santé au quotidien.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Consultez les détails, vérifiez les informations disponibles et échangez avec
                  notre équipe avant de commander.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-12">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          <FeatureCard
            icon={ShieldCheck}
            title="Sélection rigoureuse"
            description="Des références choisies avec attention pour leur usage et leurs caractéristiques."
          />
          <FeatureCard
            icon={Truck}
            title="Livraison en Tunisie"
            description="Les modalités de livraison sont confirmées avec vous lors de la commande."
          />
          <FeatureCard
            icon={HeartHandshake}
            title="Conseil humain"
            description="Une équipe disponible pour vous aider à choisir le produit adapté."
          />
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <SectionHeader
          eyebrow="Explorer"
          title="Les catégories essentielles"
          description="Accédez rapidement aux familles de produits BA Medical Store."
          actionLabel="Voir toutes les catégories"
          actionTo="/categories"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 8).map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-12 sm:py-16">
        <div className="container-page">
          <SectionHeader
            eyebrow="Sélection"
            title="Produits disponibles"
            description="Les références actuellement publiées dans notre catalogue."
            actionLabel="Tout le catalogue"
            actionTo="/catalogue"
          />
          <PublicProductsGrid />
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <SectionHeader
          eyebrow="Marques"
          title="Des marques reconnues"
          description="Découvrez les marques présentes dans notre sélection."
          actionLabel="Toutes les marques"
          actionTo="/brands"
        />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {BRANDS.slice(0, 6).map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <div className="overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-12">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                Besoin d’aide ?
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Nous vous orientons vers le bon produit.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
                Pour une question produit, une disponibilité ou une commande, échangez directement
                avec BA Medical Store.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Contacter BA Medical Store <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function PublicProductsGrid() {
  const fetchProducts = useServerFn(listPublicProducts);
  const { data, isPending, isError } = useQuery({
    queryKey: ["public-products", { limit: 4 }],
    queryFn: () => fetchProducts({ data: { limit: 4 } }),
  });

  if (isPending) return <ProductGridSkeleton count={4} />;
  if (isError || data?.error) {
    return <ErrorState description="Catalogue temporairement indisponible." />;
  }

  const products = (data?.products ?? []).map((row) => toProduct(row));
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Le catalogue arrive"
        description="Les produits seront progressivement publiés dans cette sélection."
        action={
          <Button asChild variant="outline">
            <Link to="/contact">Nous contacter</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
