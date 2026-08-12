/**
 * Colonnes produit partagées entre les chemins de lecture (catalogue, panier).
 * Module client-safe : uniquement une constante de projection PostgREST.
 */
export const PRODUCT_COLUMNS = `
  id, name, slug, description, sku, category_id, brand_id, supplier_id,
  price, professional_price, currency, ce_certified, warranty_months,
  technical_specs, active, created_at, updated_at,
  brand:brands ( name, slug ),
  category:categories ( name, slug ),
  media:product_media ( url, position ),
  documents:product_documents ( label, url )
` as const;
