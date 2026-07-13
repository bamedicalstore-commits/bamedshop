
-- ============================================================================
-- BA MEDICAL STORE — Sprint Backend B1
-- Fondations (Auth/RBAC) + Catalogue + Commerce
-- Adapté à Lovable Cloud (Supabase Auth) — fidèle à schema.sql / CONVENTIONS.md
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================================
-- ENUMS (miroir schema.sql, hors auth interne)
-- ============================================================================
CREATE TYPE app_role                AS ENUM ('client','commercial','preparateur','admin','super_admin');
CREATE TYPE order_status            AS ENUM ('pending_payment','paid','processing','shipped','delivered','cancelled','refunded');
CREATE TYPE preparation_status      AS ENUM ('to_prepare','in_preparation','ready_to_ship','shipped');
CREATE TYPE payment_method          AS ENUM ('card','bank_transfer','cash_on_delivery');
CREATE TYPE subscription_status     AS ENUM ('active','suspended','cancelled','pending');
CREATE TYPE product_document_type   AS ENUM ('notice','certificate_ce','certificate_iso','other');
CREATE TYPE product_media_type      AS ENUM ('image','video');
CREATE TYPE client_document_type    AS ENUM ('invoice','certificate','warranty_card','other');
CREATE TYPE notification_type       AS ENUM ('order','subscription','promotion','system');
CREATE TYPE warranty_status         AS ENUM ('active','expired','claimed');
CREATE TYPE coupon_type             AS ENUM ('percentage','fixed');
CREATE TYPE promotion_type          AS ENUM ('percentage','fixed','bundle');

-- ============================================================================
-- FONCTION UTILITAIRE : set_updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- DOMAINE : IDENTITÉ (profiles + user_roles + has_role)
-- ============================================================================
CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               CITEXT NOT NULL UNIQUE,
  first_name          TEXT NOT NULL DEFAULT '',
  last_name           TEXT NOT NULL DEFAULT '',
  phone               TEXT,
  company_name        TEXT,
  profession          TEXT,
  is_ba_medical_plus  BOOLEAN NOT NULL DEFAULT false,
  active              BOOLEAN NOT NULL DEFAULT true,
  blocked_reason      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_active ON public.profiles(active);
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role : brique unique RBAC (SECURITY DEFINER, évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- is_staff : commercial, preparateur, admin, super_admin
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('commercial','preparateur','admin','super_admin')
  );
$$;

-- Trigger : création automatique du profil + rôle 'client' à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, company_name, profession)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name',''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'profession'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies : profiles
CREATE POLICY "profiles_self_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_staff_manage" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- Policies : user_roles (lecture self + staff ; écriture super_admin uniquement)
CREATE POLICY "user_roles_self_read" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "user_roles_super_admin_write" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Préférences notifications
CREATE TABLE public.notification_preferences (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_orders      BOOLEAN NOT NULL DEFAULT true,
  email_promotions  BOOLEAN NOT NULL DEFAULT true,
  sms_orders        BOOLEAN NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_prefs_self" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- DOMAINE : CATALOGUE
-- ============================================================================
CREATE TABLE public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  parent_id  UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_staff_write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.brands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  logo_url      TEXT,
  ce_certified  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands_public_read" ON public.brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "brands_staff_write" ON public.brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.suppliers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  contact_email  CITEXT,
  contact_phone  TEXT,
  country        TEXT DEFAULT 'Tunisie',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers_staff_read" ON public.suppliers FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "suppliers_admin_write" ON public.suppliers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  sku                 TEXT NOT NULL UNIQUE,
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id            UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  supplier_id         UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  price               NUMERIC(12,3) NOT NULL CHECK (price >= 0),
  professional_price  NUMERIC(12,3) CHECK (professional_price >= 0),
  currency            TEXT NOT NULL DEFAULT 'TND',
  ce_certified        BOOLEAN NOT NULL DEFAULT true,
  warranty_months     INTEGER DEFAULT 0,
  technical_specs     JSONB NOT NULL DEFAULT '{}'::jsonb,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_supplier ON public.products(supplier_id);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_name_trgm ON public.products USING gin (to_tsvector('french', name));
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read_active" ON public.products FOR SELECT TO anon USING (active);
CREATE POLICY "products_auth_read" ON public.products FOR SELECT TO authenticated
  USING (active OR public.is_staff(auth.uid()));
CREATE POLICY "products_staff_write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.product_documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type       product_document_type NOT NULL,
  label      TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_documents_product ON public.product_documents(product_id);
GRANT SELECT ON public.product_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_documents TO authenticated;
GRANT ALL ON public.product_documents TO service_role;
ALTER TABLE public.product_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_docs_public_read" ON public.product_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_docs_staff_write" ON public.product_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.product_media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type       product_media_type NOT NULL,
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_media_product ON public.product_media(product_id);
GRANT SELECT ON public.product_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_media TO authenticated;
GRANT ALL ON public.product_media TO service_role;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_media_public_read" ON public.product_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_media_staff_write" ON public.product_media FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.packs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  pack_price  NUMERIC(12,3) NOT NULL CHECK (pack_price >= 0),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_packs_updated_at BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.packs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.packs TO authenticated;
GRANT ALL ON public.packs TO service_role;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packs_public_read_active" ON public.packs FOR SELECT TO anon USING (active);
CREATE POLICY "packs_auth_read" ON public.packs FOR SELECT TO authenticated
  USING (active OR public.is_staff(auth.uid()));
CREATE POLICY "packs_staff_write" ON public.packs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.pack_products (
  pack_id    UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  PRIMARY KEY (pack_id, product_id)
);
GRANT SELECT ON public.pack_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pack_products TO authenticated;
GRANT ALL ON public.pack_products TO service_role;
ALTER TABLE public.pack_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pack_products_public_read" ON public.pack_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pack_products_staff_write" ON public.pack_products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.product_relations (
  product_id         UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  relation_type      TEXT NOT NULL CHECK (relation_type IN ('related','frequently_bought_together')),
  PRIMARY KEY (product_id, related_product_id, relation_type),
  CHECK (product_id <> related_product_id)
);
GRANT SELECT ON public.product_relations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_relations TO authenticated;
GRANT ALL ON public.product_relations TO service_role;
ALTER TABLE public.product_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_relations_public_read" ON public.product_relations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_relations_staff_write" ON public.product_relations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============================================================================
-- DOMAINE : CLIENT (adresses)
-- ============================================================================
CREATE TABLE public.addresses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label          TEXT,
  recipient_name TEXT NOT NULL,
  phone          TEXT NOT NULL,
  address_line1  TEXT NOT NULL,
  address_line2  TEXT,
  city           TEXT NOT NULL,
  governorate    TEXT NOT NULL,
  postal_code    TEXT,
  is_default     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user ON public.addresses(user_id);
CREATE UNIQUE INDEX uq_addresses_default_per_user ON public.addresses(user_id) WHERE is_default;
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_self" ON public.addresses FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============================================================================
-- DOMAINE : COUPONS & PROMOTIONS
-- ============================================================================
CREATE TABLE public.coupons (
  code        TEXT PRIMARY KEY,
  type        coupon_type NOT NULL,
  value       NUMERIC(12,3) NOT NULL CHECK (value >= 0),
  valid_until TIMESTAMPTZ,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_public_read_valid" ON public.coupons FOR SELECT TO anon, authenticated
  USING (active AND (valid_until IS NULL OR valid_until > now()));
CREATE POLICY "coupons_staff_write" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.promotions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  type       promotion_type NOT NULL,
  value      NUMERIC(12,3) NOT NULL CHECK (value >= 0),
  starts_at  TIMESTAMPTZ NOT NULL,
  ends_at    TIMESTAMPTZ NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions_public_read_active" ON public.promotions FOR SELECT TO anon, authenticated
  USING (active AND now() BETWEEN starts_at AND ends_at);
CREATE POLICY "promotions_staff_write" ON public.promotions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.promotion_categories (
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, category_id)
);
GRANT SELECT ON public.promotion_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.promotion_categories TO authenticated;
GRANT ALL ON public.promotion_categories TO service_role;
ALTER TABLE public.promotion_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_cat_public_read" ON public.promotion_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "promo_cat_staff_write" ON public.promotion_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============================================================================
-- DOMAINE : PANIER
-- ============================================================================
CREATE TABLE public.carts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  applied_coupon_code TEXT REFERENCES public.coupons(code) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carts_self" ON public.carts FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (user_id = auth.uid());

CREATE TABLE public.cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,3) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);
CREATE INDEX idx_cart_items_cart ON public.cart_items(cart_id);
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_items_self" ON public.cart_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND (c.user_id = auth.uid() OR public.is_staff(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.user_id = auth.uid()));

-- ============================================================================
-- DOMAINE : COMMANDES
-- ============================================================================
CREATE TABLE public.orders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number           TEXT NOT NULL UNIQUE,
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status                 order_status NOT NULL DEFAULT 'pending_payment',
  preparation_status     preparation_status NOT NULL DEFAULT 'to_prepare',
  shipping_address_id    UUID NOT NULL REFERENCES public.addresses(id) ON DELETE RESTRICT,
  subtotal               NUMERIC(12,3) NOT NULL CHECK (subtotal >= 0),
  shipping_cost          NUMERIC(12,3) NOT NULL DEFAULT 0,
  discount_total         NUMERIC(12,3) NOT NULL DEFAULT 0,
  total                  NUMERIC(12,3) NOT NULL CHECK (total >= 0),
  currency               TEXT NOT NULL DEFAULT 'TND',
  payment_method         payment_method NOT NULL,
  coupon_code            TEXT REFERENCES public.coupons(code) ON DELETE SET NULL,
  invoice_url            TEXT,
  notes                  TEXT,
  placed_by_sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_preparation_status ON public.orders(preparation_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_self_read" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "orders_self_insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_staff_update" ON public.orders FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(12,3) NOT NULL CHECK (unit_price >= 0),
  line_total   NUMERIC(12,3) NOT NULL CHECK (line_total >= 0)
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_owner_read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "order_items_owner_insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL DEFAULT 'card',
  payment_intent_id TEXT,
  amount            NUMERIC(12,3) NOT NULL CHECK (amount >= 0),
  status            TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed','refunded')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON public.payments(order_id);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_owner_read" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "payments_staff_write" ON public.payments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier         TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  shipped_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_shipments_order ON public.shipments(order_id);
GRANT SELECT ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipments_owner_read" ON public.shipments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "shipments_staff_write" ON public.shipments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.order_picking_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity           INTEGER NOT NULL CHECK (quantity > 0),
  warehouse_location TEXT,
  picked             BOOLEAN NOT NULL DEFAULT false,
  packed             BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX idx_picking_items_order ON public.order_picking_items(order_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_picking_items TO authenticated;
GRANT ALL ON public.order_picking_items TO service_role;
ALTER TABLE public.order_picking_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "picking_staff_only" ON public.order_picking_items FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================================
-- DOMAINE : CLIENT (wishlist, garanties, documents, notifications)
-- ============================================================================
CREATE TABLE public.wishlist_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX idx_wishlist_user ON public.wishlist_items(user_id);
GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_self" ON public.wishlist_items FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (user_id = auth.uid());

CREATE TABLE public.warranties (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  order_id   UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  status     warranty_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);
CREATE INDEX idx_warranties_user ON public.warranties(user_id);
CREATE INDEX idx_warranties_status ON public.warranties(status);
GRANT SELECT ON public.warranties TO authenticated;
GRANT ALL ON public.warranties TO service_role;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warranties_self_read" ON public.warranties FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "warranties_staff_write" ON public.warranties FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.client_documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  type       client_document_type NOT NULL,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_documents_user ON public.client_documents(user_id);
GRANT SELECT ON public.client_documents TO authenticated;
GRANT ALL ON public.client_documents TO service_role;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_docs_self_read" ON public.client_documents FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "client_docs_staff_write" ON public.client_documents FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  type       notification_type NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE NOT read;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_self_read" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "notifications_self_update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_staff_write" ON public.notifications FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================================
-- DOMAINE : ABONNEMENTS BA MEDICAL+
-- ============================================================================
CREATE TABLE public.subscription_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  price_monthly NUMERIC(12,3) NOT NULL CHECK (price_monthly >= 0),
  benefits      JSONB NOT NULL DEFAULT '[]'::jsonb,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read_active" ON public.subscription_plans FOR SELECT TO anon, authenticated
  USING (active OR public.is_staff(auth.uid()));
CREATE POLICY "plans_admin_write" ON public.subscription_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id      UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status       subscription_status NOT NULL DEFAULT 'pending',
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  renews_at    TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE UNIQUE INDEX uq_subscriptions_active_per_user ON public.subscriptions(user_id)
  WHERE status IN ('active','pending');
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_self_read" ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "subscriptions_self_insert" ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "subscriptions_staff_update" ON public.subscriptions FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
