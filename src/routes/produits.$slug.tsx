import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info, MessageCircle, Phone } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CategoryIcon } from "@/components/catalogue/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  CATALOGUE_PRODUCTS,
  findCatalogueCategory,
  findCatalogueProduct,
  priceRequestMessage,
} from "@/constants/catalogue";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  jsonLdScript,
  SITE_NAME,
  whatsappLink,
} from "@/lib/site";

/*
 * Fiche produit — plan B. Aucun prix : « Prix sur WhatsApp ».
 * Pas de données structurées Product/Offer tant qu'il n'y a ni prix ni photo
 * officielle (Google les jugerait incomplètes) : fil d'Ariane seulement.
 */

export const Route = createFileRoute("/produits/$slug")({
  loader: ({ params }) => {
    const product = findCatalogueProduct(params.slug);
    if (!product) throw notFound();
    return { slug: product.slug };
  },
  head: ({ loaderData }) => {
    const product = loaderData ? findCatalogueProduct(loaderData.slug) : undefined;
    if (!product) {
      return {
        meta: [
          { title: `Produit introuvable — ${SITE_NAME}` },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const path = `/produits/${product.slug}`;
    const category = findCatalogueCategory(product.category);
    const description = `${product.description} Marque ${product.brand}, réf. ${product.sku}. Prix sur WhatsApp, paiement à la livraison partout en Tunisie.`;
    return {
      meta: [
        { title: `${product.name} — ${SITE_NAME}` },
        { name: "description", content: description },
        { property: "og:title", content: product.name },
        { property: "og:description", content: description },
        { property: "og:url", content: absoluteUrl(path) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(path) }],
      scripts: [
        jsonLdScript(
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Produits", path: "/produits" },
            { name: category.name, path: `/produits#${category.slug}` },
            { name: product.name, path },
          ]),
        ),
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-16">
        <h1 className="text-2xl font-semibold">Produit introuvable</h1>
        <Button asChild size="lg" className="mt-6 h-12">
          <Link to="/produits">Voir tous nos produits</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const product = findCatalogueProduct(slug);
  if (!product) return null;

  const category = findCatalogueCategory(product.category);
  const whatsappHref = whatsappLink(priceRequestMessage(product));
  const related = CATALOGUE_PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 3);
  const isDiabetes = product.category === "diabete-surveillance-glycemique";

  return (
    <SiteLayout>
      <div className="container-page py-8">
        <Link
          to="/produits"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Tous les produits
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="flex items-start gap-4">
              <CategoryIcon category={product.category} className="size-16" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">{category.name}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {product.name}
                </h1>
              </div>
            </div>

            <p className="mt-6 text-base">{product.description}</p>

            {product.note ? (
              <p className="mt-4 flex gap-2 rounded-xl bg-primary-soft p-4 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {product.note}
              </p>
            ) : null}

            <dl className="mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Marque</dt>
              <dd className="font-medium">{product.brand}</dd>
              <dt className="text-muted-foreground">Référence</dt>
              <dd className="font-medium tabular-nums">{product.sku}</dd>
              <dt className="text-muted-foreground">Paiement</dt>
              <dd className="font-medium">À la livraison</dd>
            </dl>
          </div>

          {/* Action principale : demander le prix */}
          <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-28">
            <p className="text-sm text-muted-foreground">Prix</p>
            <p className="mt-1 text-lg font-semibold">Sur demande, par WhatsApp</p>
            <div className="mt-5 grid gap-3">
              {whatsappHref ? (
                <Button asChild size="lg" className="h-14 text-base">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-5" aria-hidden="true" /> Prix sur WhatsApp
                  </a>
                </Button>
              ) : null}
              <Button asChild size="lg" variant="outline" className="h-12">
                <a href={`tel:+${BUSINESS_PHONE_E164}`}>
                  <Phone className="size-5" aria-hidden="true" /> {BUSINESS_PHONE_DISPLAY}
                </a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Livraison partout en Tunisie · offerte dès 200 DT · paiement à la livraison
            </p>
          </aside>
        </div>

        {isDiabetes ? (
          <Link
            to="/packs/diabete"
            className="mt-10 flex min-h-11 items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary-soft p-5 hover:border-primary"
          >
            <span>
              <span className="block font-semibold">Pack Diabète et abonnement trimestriel</span>
              <span className="block text-sm text-muted-foreground">
                Vos consommables livrés tous les 3 mois, sans y penser.
              </span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-primary" aria-hidden="true" />
          </Link>
        ) : null}

        {related.length > 0 ? (
          <section aria-labelledby="similaires" className="mt-10">
            <h2 id="similaires" className="text-lg font-semibold">
              Dans la même catégorie
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/produits/$slug"
                    params={{ slug: p.slug }}
                    className="flex min-h-11 flex-col rounded-xl border border-border bg-card p-4 hover:border-primary"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {p.brand} · réf. {p.sku}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SiteLayout>
  );
}
