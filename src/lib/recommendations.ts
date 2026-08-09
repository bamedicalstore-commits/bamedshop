/**
 * Moteur de recommandations (mock).
 * À terme, ces fonctions seront remplacées par un appel serveur
 * (Server Function `recommendations.*`) alimenté par les données réelles
 * de commandes, de vues et d'abonnements — la signature reste stable.
 */
import type { Product } from "@/types/product";

/** Produits similaires — même catégorie, tri par note descendante. */
export function similarProducts(product: Product, all: Product[], limit = 4): Product[] {
  return all
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}

/**
 * "Souvent achetés ensemble".
 * Heuristique : consommables & accessoires compatibles, sinon produits
 * complémentaires de catégories différentes fréquemment associés.
 */
export function frequentlyBoughtTogether(product: Product, all: Product[], limit = 3): Product[] {
  const compat = new Set(product.compatibleWith ?? []);
  const scored = all
    .filter((p) => p.id !== product.id && p.availability !== "out_of_stock")
    .map((p) => {
      let score = 0;
      if (compat.has(p.slug) || compat.has(p.sku ?? "")) score += 100;
      if (p.categorySlug === "consommables" && product.categorySlug !== "consommables") score += 10;
      if (p.brandSlug === product.brandSlug) score += 3;
      if (p.categorySlug !== product.categorySlug) score += 2;
      if (p.isBestSeller) score += 2;
      score += p.rating ?? 0;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.p);
}

/** Total minor units d'un bundle. */
export function bundleTotalMinor(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.price.amount, 0);
}
