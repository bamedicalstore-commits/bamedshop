import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Article — BA Medical Store` },
      { name: "description", content: `Article ${params.slug} — conseils et bonnes pratiques.` },
      { property: "og:type", content: "article" },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  return (
    <SiteLayout>
      <article className="container-page max-w-3xl py-14">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/blog">
            <ArrowLeft aria-hidden="true" /> Retour au blog
          </Link>
        </Button>
        <Badge variant="soft">Guides</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {slug.replace(/-/g, " ").replace(/^./, (c: string) => c.toUpperCase())}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Publié le 12 mars 2025 · 5 min de lecture
        </p>
        <div className="mt-8 grid aspect-[16/9] place-items-center rounded-xl bg-gradient-to-br from-primary-soft to-info-soft text-primary/40">
          <BookOpen className="size-20" aria-hidden="true" />
        </div>
        <div className="prose prose-neutral mt-10 max-w-none text-foreground">
          <p className="text-lg text-muted-foreground">
            Le contenu détaillé de cet article sera intégré au branchement du CMS. Cette page est un
            shell UI destiné à valider la mise en page éditoriale du blog BA Medical Store.
          </p>
          <p>
            Le style typographique, l'espacement, les liens et la hiérarchie visuelle sont déjà
            calibrés pour offrir une lecture confortable sur toutes tailles d'écran.
          </p>
        </div>
      </article>
    </SiteLayout>
  );
}
