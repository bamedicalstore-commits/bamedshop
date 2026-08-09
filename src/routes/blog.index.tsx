import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";

const POSTS = [
  { slug: "choisir-tensiometre", title: "Comment bien choisir son tensiomètre pour un cabinet ?", excerpt: "Nos conseils experts pour investir dans un tensiomètre fiable et durable.", category: "Guides", date: "12 mars 2025", read: "5 min" },
  { slug: "hygiene-cabinet", title: "Protocoles d'hygiène en cabinet médical", excerpt: "Les bonnes pratiques pour un environnement sûr et conforme.", category: "Bonnes pratiques", date: "05 mars 2025", read: "8 min" },
  { slug: "kine-materiel", title: "Équipement essentiel du kinésithérapeute", excerpt: "Notre checklist complète pour équiper un cabinet de kiné.", category: "Guides", date: "22 février 2025", read: "6 min" },
];

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog & conseils — BA Medical Store" },
      { name: "description", content: "Guides d'achat, bonnes pratiques et actualités du secteur médical." },
      { property: "og:title", content: "Blog — BA Medical Store" },
      { property: "og:description", content: "Guides et bonnes pratiques pour professionnels de santé." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <SiteLayout>
      <div className="container-page py-14">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog & conseils</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Guides d'achat, bonnes pratiques et actualités du secteur médical.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group">
              <Card className="flex h-full flex-col overflow-hidden border-border/70 transition-all hover:shadow-[var(--shadow-elevated)]">
                <div className="grid aspect-[16/10] place-items-center bg-gradient-to-br from-primary-soft to-info-soft text-primary/40">
                  <BookOpen className="size-12" aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <Badge variant="soft" className="w-fit">{p.category}</Badge>
                  <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {p.title}
                  </h2>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.date} · {p.read}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      Lire <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
