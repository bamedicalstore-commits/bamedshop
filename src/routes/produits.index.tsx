import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CategoryIcon } from "@/components/catalogue/CategoryIcon";
import { Button } from "@/components/ui/button";
import { CATALOGUE_CATEGORIES, CATALOGUE_PRODUCTS } from "@/constants/catalogue";
import { absoluteUrl, breadcrumbJsonLd, jsonLdScript, SITE_NAME, whatsappLink } from "@/lib/site";

/*
 * Catalogue — plan B : 45 produits réels (listes Pharmatec et Rossmax),
 * sans aucun prix. Le prix se demande sur WhatsApp.
 */

const TITLE = "Nos produits : diabète, tension, nébulisation";
const DESCRIPTION = `${CATALOGUE_PRODUCTS.length} produits Bionime, Rossmax, Sterilance, Clickfine et Mission : lecteurs et bandelettes de glycémie, aiguilles à insuline, tensiomètres, nébuliseurs. Prix sur WhatsApp, livraison partout en Tunisie.`;

export const Route = createFileRoute("/produits/")({
  head: () => ({
    meta: [
      { title: `${TITLE} — ${SITE_NAME}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `${TITLE} — ${SITE_NAME}` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/produits") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/produits") }],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Produits", path: "/produits" },
        ]),
      ),
    ],
  }),
  component: CataloguePage,
});

function CataloguePage() {
  const whatsappHref = whatsappLink(
    "Bonjour BA Medical, je cherche un produit qui n'est pas dans votre catalogue.",
  );

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Nos produits</h1>
          <p className="mt-3 text-muted-foreground">
            {CATALOGUE_PRODUCTS.length} produits du distributeur officiel en Tunisie. Le prix vous
            est donné sur WhatsApp ; paiement à la livraison.
          </p>
        </header>

        {/* Accès direct aux catégories */}
        <nav aria-label="Catégories" className="mt-6 flex flex-wrap gap-2">
          {CATALOGUE_CATEGORIES.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary"
            >
              {c.name}
            </a>
          ))}
        </nav>

        {CATALOGUE_CATEGORIES.map((category) => {
          const products = CATALOGUE_PRODUCTS.filter((p) => p.category === category.slug);
          if (products.length === 0) return null;
          return (
            <section
              key={category.slug}
              id={category.slug}
              aria-labelledby={`h-${category.slug}`}
              className="mt-10 scroll-mt-24"
            >
              <h2
                id={`h-${category.slug}`}
                className="flex items-center gap-3 text-xl font-semibold"
              >
                <CategoryIcon category={category.slug} className="size-9" />
                {category.name}
                <span className="text-sm font-normal text-muted-foreground tabular-nums">
                  ({products.length})
                </span>
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/produits/$slug"
                      params={{ slug: p.slug }}
                      className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{p.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {p.brand} · réf. {p.sku}
                        </span>
                      </span>
                      <ChevronRight
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="mt-12 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">Vous ne trouvez pas un produit ?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demandez-nous : nous vous répondons sur WhatsApp.
          </p>
          {whatsappHref ? (
            <Button asChild size="lg" className="mt-4 h-12">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-5" aria-hidden="true" /> Nous écrire
              </a>
            </Button>
          ) : null}
        </section>
      </div>
    </SiteLayout>
  );
}
