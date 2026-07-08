export type Currency = "TND" | "EUR" | "USD";

export type Money = {
  amount: number; // in minor units (millimes for TND)
  currency: Currency;
};

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  shortDescription?: string;
  description?: string;
  images: string[];
  price: Money;
  compareAtPrice?: Money;
  rating?: number;
  ratingCount?: number;
  availability: Availability;
  isNew?: boolean;
  isBestSeller?: boolean;
  discountPercent?: number;
  sku?: string;
  reference?: string;
  variants?: ProductVariant[];
  attributes?: Record<string, string>;
  documents?: { label: string; url: string }[];
};

export type ProductVariant = {
  id: string;
  label: string;
  value: string;
  price?: Money;
  availability?: Availability;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  productCount?: number;
  image?: string;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  productCount?: number;
};
