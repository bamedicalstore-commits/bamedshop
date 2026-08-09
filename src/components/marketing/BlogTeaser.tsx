import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ArrowRight, Newspaper } from "lucide-react";

const POSTS = [
  { slug: "controler-tension-domicile", title: "Comment bien contrôler sa tension à domicile", excerpt: "5 règles simples pour des mesures fiables et éviter les erreurs les plus courantes.", category: "Prévention", readTime: "4 min" },
  { slug: "equiper-cabinet-neuf", title: "Équiper un cabinet médical neuf : la checklist", excerpt: "L'inventaire complet pour ouvrir un cabinet en 2026, matériel et budget indicatif.", category: "Pro", readTime: "8 min" },
  { slug: "hygiene-mains-soignants", title: "Hygiène des mains : le geste vital", excerpt: "Protocoles OMS, produits recommandés et bonnes pratiques quotidiennes.", category: "Hygiène", readTime: "3 min" },
];

export function BlogTeaser() {
  return (
    <section aria-labelledby="blog" className="container-page py-14">
      <SectionHeader
        eyebrow="Blog santé"
        title="Conseils & actualités médicales"
        actionLabel="Tous les articles"
        actionTo="/blog"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {POSTS.map((p) => (
          <Card key={p.slug} className="group flex flex-col overflow-hidden p-0">
            <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-primary-soft to-info-soft text-primary/60">
              <Newspaper className="size-10" aria-hidden="true" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-primary">{p.category}</span>
                <span>·</span>
                <span>{p.readTime}</span>
              </div>
              <h3 className="text-base font-semibold group-hover:text-primary">
                <Link to="/blog/$slug" params={{ slug: p.slug }}>{p.title}</Link>
              </h3>
              <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                Lire l'article <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
