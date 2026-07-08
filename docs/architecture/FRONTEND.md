# BA Medical Store — Frontend

Couche UI complète, sans logique métier, prête à recevoir le backend Lovable Cloud.

## Stack

React 19 · TanStack Start · TypeScript · TanStack Router · TanStack Query ·
Tailwind CSS v4 · shadcn/ui · React Hook Form · Zod · Lucide Icons.

## Design System

Tokens dans `src/styles.css` (oklch, `@theme inline`) :
- `--primary` Vert Santé (#2E8B57), `--primary-hover`, `--primary-soft`
- `--secondary` bleu discret pour actions secondaires
- `--success` / `--warning` / `--info` / `--destructive` + variantes soft
- Neutrals `--surface`, `--surface-muted`, `--muted`, `--border`
- Shadows `--shadow-soft`, `--shadow-elevated`, `--shadow-brand`
- Utilities : `container-page`, `surface-card`, `surface-elevated`
- Support du mode sombre prévu (classe `.dark`) mais non activé

Aucune couleur hardcodée dans les composants — toujours via tokens.

## Arborescence

```
src/
  components/
    ui/                 # primitives shadcn
    layout/             # SiteHeader, SiteFooter, AnnouncementBar, SiteLayout
    ecommerce/          # ProductCard, PriceBlock, Rating, QuantitySelector,
                        # WishlistButton, AddToCartButton, AvailabilityBadge,
                        # CategoryCard, BrandCard
    common/             # SectionHeader, FeatureCard
    feedback/           # EmptyState, ErrorState, PageLoader
  constants/            # navigation, catalogue mock
  lib/                  # utils, format (money/dates)
  types/                # product, order, user
  routes/               # TanStack file-based routing
  styles.css            # tokens & utilities
```

## Pages livrées (UI shells)

Publiques (SiteLayout) : `/`, `/catalogue`, `/categories`, `/categories/$slug`,
`/brands`, `/brands/$slug`, `/product/$slug`, `/search`, `/cart`, `/checkout`,
`/auth`, `/contact`, `/faq`, `/blog`, `/blog/$slug`.

Compte client : `/account` (layout) → profil, `/account/orders`,
`/account/subscriptions`, `/account/wishlist`.

Administration : `/admin` (layout dédié) → tableau de bord, `/admin/b2b`.

## Conventions

- Composants : PascalCase (`ProductCard.tsx`)
- Hooks : `use*` en camelCase
- Un composant = une responsabilité — pas de duplication, tout est réutilisable
- `sr-only` et `aria-*` systématiquement pour icônes et actions
- Meta `head()` unique par route publique (SEO)
- Mobile first, breakpoints Tailwind (`sm`, `md`, `lg`, `xl`)

## Accessibilité

- WCAG AA sur les contrastes (tokens vérifiés)
- Focus visible (`:focus-visible` global)
- Navigation clavier complète (Radix via shadcn)
- Labels et `aria-label` sur toutes les actions icône seule
- Landmarks : `<header>`, `<nav>`, `<main>`, `<footer>` uniques par page

## Prochaines étapes (Backend Agent)

Le Frontend attend :
- Modèles catalogue → `MOCK_PRODUCTS` dans `src/constants/navigation.ts`
  sera remplacé par un query loader Cloud
- Auth Cloud → brancher `/auth` sur `supabase.auth.*` (client publishable)
- Panier → migrer l'état local vers un domaine Commerce persisté
- Commandes / abonnements / wishlist → hooks TanStack Query sur les tables
- Admin → gates via `_authenticated` + `has_role('admin')`
