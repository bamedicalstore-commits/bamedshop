-- =====================================================================
-- BA Medical Store — Canonical PostgreSQL Schema (Lovable Cloud / Supabase)
-- =====================================================================
-- Source of truth for the database. Documentation only until Cloud is
-- enabled; will then be split into ordered migration files following
-- docs/database/migrations-strategy.md.
--
-- Conventions:
--   * Every public table: GRANT then ENABLE RLS then POLICIES.
--   * Money is stored in minor units (bigint) + ISO currency code.
--   * Timestamps in UTC (timestamptz). Soft delete via deleted_at.
--   * All FKs are explicit; ON DELETE default = RESTRICT.
-- =====================================================================

-- ---------- 0. Extensions ----------
create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";
-- Enable when embeddings go live:
-- create extension if not exists "vector";

-- ---------- 1. Enums ----------
create type app_role            as enum ('admin','staff','b2b','customer');
create type user_status         as enum ('active','pending','suspended','deleted');
create type availability        as enum ('in_stock','low_stock','out_of_stock','preorder','discontinued');
create type usage_profile       as enum ('professional','personal','both');
create type prof_profile        as enum ('particulier','infirmier','medecin','cabinet','clinique','pharmacie');
create type order_status        as enum ('draft','pending','confirmed','processing','shipped','delivered','cancelled','refunded','returned');
create type payment_status      as enum ('pending','authorized','captured','failed','refunded','partially_refunded','cancelled');
create type payment_method      as enum ('card','bank_transfer','cash_on_delivery','wallet','installment','b2b_credit');
create type shipment_status     as enum ('label_created','picked_up','in_transit','out_for_delivery','delivered','returned','lost');
create type subscription_status as enum ('active','paused','cancelled','expired');
create type ticket_status       as enum ('open','pending_customer','pending_staff','resolved','closed');
create type notif_channel       as enum ('in_app','email','sms','push','whatsapp');
create type stock_mvmt_kind     as enum ('inbound','outbound','adjustment','transfer','return','loss');
create type promo_kind          as enum ('percent','fixed_amount','free_shipping','bxgy','bundle');
create type document_kind       as enum ('user_manual','datasheet','certificate','invoice','prescription','warranty_card','other');
create type media_kind          as enum ('image','video','pdf','model3d');
create type audit_action        as enum ('create','update','delete','login','role_grant','role_revoke','export','impersonate');

-- ---------- 2. Utility functions ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

-- =====================================================================
-- 3. IDENTITY & ACCESS
-- =====================================================================

-- Supabase manages auth.users. Application profile is separate.
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        citext unique not null,
  full_name    text,
  phone        text,
  avatar_url   text,
  locale       text not null default 'fr-TN',
  status       user_status not null default 'active',
  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table public.roles (
  code        app_role primary key,
  label       text not null,
  description text
);

create table public.permissions (
  code        text primary key,     -- e.g. 'orders:read', 'products:write'
  description text
);

create table public.role_permissions (
  role       app_role not null references public.roles(code) on delete cascade,
  permission text     not null references public.permissions(code) on delete cascade,
  primary key (role, permission)
);

create table public.user_roles (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users(id) on delete cascade,
  role     app_role not null references public.roles(code) on delete restrict,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user and role = _role)
$$;

create table public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  label        text,
  recipient    text not null,
  phone        text not null,
  line1        text not null,
  line2        text,
  city         text not null,
  region       text,
  postal_code  text,
  country_code char(2) not null default 'TN',
  is_default_billing  boolean not null default false,
  is_default_shipping boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.addresses (user_id);

create table public.b2b_accounts (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid unique not null references auth.users(id) on delete cascade,
  company_name  text not null,
  tax_id        text unique,
  matricule_fiscal text,
  credit_limit_minor bigint not null default 0,
  payment_terms_days int not null default 0,
  status        user_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =====================================================================
-- 4. CATALOG
-- =====================================================================

create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  parent_id    uuid references public.categories(id) on delete restrict,
  slug         citext unique not null,
  name         text not null,
  description  text,
  icon         text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index on public.categories (parent_id) where deleted_at is null;

create table public.brands (
  id           uuid primary key default gen_random_uuid(),
  slug         citext unique not null,
  name         text not null,
  logo_url     text,
  description  text,
  website      text,
  country_code char(2),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table public.suppliers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  contact_email citext,
  contact_phone text,
  address_line text,
  country_code char(2),
  lead_time_days int,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.tags (
  id    uuid primary key default gen_random_uuid(),
  slug  citext unique not null,
  name  text not null,
  kind  text not null default 'general'   -- 'medical' | 'marketing' | ...
);

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          citext unique not null,
  sku           text unique,
  reference     text,
  name          text not null,
  short_description text,
  description   text,
  brand_id      uuid references public.brands(id) on delete restrict,
  category_id   uuid not null references public.categories(id) on delete restrict,
  price_minor   bigint not null check (price_minor >= 0),
  compare_at_price_minor bigint check (compare_at_price_minor is null or compare_at_price_minor >= price_minor),
  currency_code char(3) not null default 'TND',
  availability  availability not null default 'in_stock',
  usage         usage_profile,
  prescription_required boolean not null default false,
  warranty_months int check (warranty_months is null or warranty_months >= 0),
  subscription_eligible boolean not null default false,
  delivery_eta  text,
  weight_grams  int,
  attributes    jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  is_new        boolean not null default false,
  is_best_seller boolean not null default false,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(short_description,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description,'')), 'C')
  ) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index on public.products (category_id) where deleted_at is null;
create index on public.products (brand_id)    where deleted_at is null;
create index on public.products (availability) where deleted_at is null;
create index on public.products using gin (search_vector);
create index on public.products using gin (attributes jsonb_path_ops);

create table public.product_translations (
  product_id  uuid not null references public.products(id) on delete cascade,
  locale      text not null,
  name        text not null,
  short_description text,
  description text,
  primary key (product_id, locale)
);

create table public.product_variants (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  sku          text unique,
  label        text not null,     -- e.g. "Taille M"
  value        text not null,
  price_minor  bigint check (price_minor is null or price_minor >= 0),
  availability availability,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index on public.product_variants (product_id);

create table public.media_library (
  id          uuid primary key default gen_random_uuid(),
  kind        media_kind not null,
  url         text not null,
  alt         text,
  width       int,
  height      int,
  size_bytes  bigint,
  checksum    text,
  created_at  timestamptz not null default now()
);

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  media_id    uuid not null references public.media_library(id) on delete restrict,
  sort_order  int not null default 0,
  is_primary  boolean not null default false
);
create index on public.product_images (product_id);

create table public.product_documents (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  media_id    uuid not null references public.media_library(id) on delete restrict,
  kind        document_kind not null,
  label       text not null,
  locale      text not null default 'fr-TN'
);

create table public.certifications (
  code  text primary key,          -- 'ce','iso-13485','latex-free',...
  label text not null,
  description text
);

create table public.product_certifications (
  product_id        uuid not null references public.products(id) on delete cascade,
  certification_code text not null references public.certifications(code) on delete restrict,
  primary key (product_id, certification_code)
);

create table public.product_professional_profiles (
  product_id uuid not null references public.products(id) on delete cascade,
  profile    prof_profile not null,
  primary key (product_id, profile)
);

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

create table public.supplier_products (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  supplier_sku text,
  cost_minor  bigint not null default 0,
  currency_code char(3) not null default 'TND',
  lead_time_days int,
  moq         int,     -- minimum order quantity
  primary key (supplier_id, product_id)
);

create table public.price_history (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  price_minor bigint not null,
  currency_code char(3) not null,
  reason      text,
  changed_by  uuid references auth.users(id),
  changed_at  timestamptz not null default now()
);
create index on public.price_history (product_id, changed_at desc);

create table public.product_compatibilities (
  product_id_a uuid not null references public.products(id) on delete cascade,
  product_id_b uuid not null references public.products(id) on delete cascade,
  relation     text not null default 'compatible', -- 'accessory','consumable','spare_part'
  primary key (product_id_a, product_id_b, relation),
  check (product_id_a <> product_id_b)
);

create table public.product_related (
  product_id_a uuid not null references public.products(id) on delete cascade,
  product_id_b uuid not null references public.products(id) on delete cascade,
  score        numeric(6,4) not null default 0,   -- 0..1
  reason       text,
  primary key (product_id_a, product_id_b),
  check (product_id_a <> product_id_b)
);

create table public.product_fbt (          -- frequently bought together
  product_id_a uuid not null references public.products(id) on delete cascade,
  product_id_b uuid not null references public.products(id) on delete cascade,
  cooccurrence int  not null default 0,
  score        numeric(6,4) not null default 0,
  last_computed_at timestamptz not null default now(),
  primary key (product_id_a, product_id_b),
  check (product_id_a <> product_id_b)
);

-- Bundles & health packs ----------------------------------------------
create table public.bundles (
  id          uuid primary key default gen_random_uuid(),
  slug        citext unique not null,
  name        text not null,
  description text,
  price_minor bigint,       -- null = sum of items
  currency_code char(3) not null default 'TND',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.bundle_items (
  bundle_id  uuid not null references public.bundles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity   int  not null default 1 check (quantity > 0),
  primary key (bundle_id, product_id)
);

create table public.health_packs (
  id           uuid primary key default gen_random_uuid(),
  slug         citext unique not null,
  name         text not null,
  tagline      text,
  description  text,
  audience     text,
  savings_label text,
  icon         text,
  color_token  text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.health_pack_items (
  health_pack_id uuid not null references public.health_packs(id) on delete cascade,
  product_id     uuid not null references public.products(id) on delete restrict,
  quantity       int  not null default 1 check (quantity > 0),
  is_optional    boolean not null default false,
  primary key (health_pack_id, product_id)
);

-- =====================================================================
-- 5. INVENTORY (stocks / lots / mouvements)
-- =====================================================================

create table public.warehouses (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  name         text not null,
  address_line text,
  city         text,
  country_code char(2) not null default 'TN',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.stock_items (
  id             uuid primary key default gen_random_uuid(),
  warehouse_id   uuid not null references public.warehouses(id) on delete restrict,
  product_id     uuid not null references public.products(id) on delete restrict,
  variant_id     uuid references public.product_variants(id) on delete restrict,
  quantity_on_hand int not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved int not null default 0 check (quantity_reserved >= 0),
  reorder_point  int not null default 0,
  reorder_qty    int not null default 0,
  updated_at     timestamptz not null default now(),
  unique (warehouse_id, product_id, variant_id)
);
create index on public.stock_items (product_id);

create table public.product_lots (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete restrict,
  variant_id    uuid references public.product_variants(id) on delete restrict,
  warehouse_id  uuid not null references public.warehouses(id) on delete restrict,
  lot_number    text not null,
  serial_number text,
  quantity      int not null check (quantity >= 0),
  manufactured_at date,
  expires_at    date,
  supplier_id   uuid references public.suppliers(id),
  received_at   timestamptz not null default now(),
  unique (product_id, warehouse_id, lot_number)
);
create index on public.product_lots (expires_at) where expires_at is not null;

create table public.stock_movements (        -- APPEND-ONLY
  id             uuid primary key default gen_random_uuid(),
  stock_item_id  uuid not null references public.stock_items(id) on delete restrict,
  lot_id         uuid references public.product_lots(id),
  kind           stock_mvmt_kind not null,
  quantity_delta int not null,   -- signed
  reason         text,
  reference_type text,           -- 'order','purchase_order','return','manual'
  reference_id   uuid,
  performed_by   uuid references auth.users(id),
  created_at     timestamptz not null default now()
);
create index on public.stock_movements (stock_item_id, created_at desc);

-- =====================================================================
-- 6. COMMERCE (carts, orders, payments, invoices)
-- =====================================================================

create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  anon_token  text unique,       -- guest cart
  currency_code char(3) not null default 'TND',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (user_id is not null or anon_token is not null)
);

create table public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  cart_id    uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id),
  quantity   int not null default 1 check (quantity > 0),
  unit_price_minor bigint not null,
  added_at   timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text unique not null,   -- 'BA-2026-000123'
  customer_id    uuid not null references auth.users(id) on delete restrict,
  b2b_account_id uuid references public.b2b_accounts(id),
  status         order_status not null default 'pending',
  currency_code  char(3) not null default 'TND',
  subtotal_minor bigint not null default 0,
  discount_minor bigint not null default 0,
  shipping_minor bigint not null default 0,
  tax_minor      bigint not null default 0,
  total_minor    bigint not null default 0,
  billing_address_id  uuid references public.addresses(id),
  shipping_address_id uuid references public.addresses(id),
  notes          text,
  placed_at      timestamptz,
  cancelled_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on public.orders (customer_id, created_at desc);
create index on public.orders (status);

create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete restrict,
  variant_id   uuid references public.product_variants(id),
  name_snapshot text not null,   -- historical name at order time
  sku_snapshot  text,
  quantity     int not null check (quantity > 0),
  unit_price_minor bigint not null,
  discount_minor bigint not null default 0,
  tax_minor    bigint not null default 0,
  total_minor  bigint not null
);
create index on public.order_items (order_id);
create index on public.order_items (product_id);

create table public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status  order_status not null,
  reason     text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete restrict,
  method        payment_method not null,
  status        payment_status not null default 'pending',
  amount_minor  bigint not null,
  currency_code char(3) not null,
  provider      text,          -- 'stripe','paddle','clictopay',...
  provider_ref  text,
  captured_at   timestamptz,
  refunded_amount_minor bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.payments (order_id);

create table public.invoices (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete restrict,
  number        text unique not null,
  issued_at     timestamptz not null default now(),
  due_at        timestamptz,
  total_minor   bigint not null,
  currency_code char(3) not null,
  pdf_media_id  uuid references public.media_library(id),
  created_at    timestamptz not null default now()
);

create table public.prescriptions (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  media_id     uuid not null references public.media_library(id),
  doctor_name  text,
  validated_by uuid references auth.users(id),
  validated_at timestamptz,
  created_at   timestamptz not null default now()
);

create table public.warranties (
  id             uuid primary key default gen_random_uuid(),
  order_item_id  uuid not null references public.order_items(id) on delete cascade,
  months         int  not null check (months > 0),
  starts_on      date not null,
  ends_on        date not null,
  serial_number  text,
  certificate_media_id uuid references public.media_library(id),
  status         text not null default 'active',
  created_at     timestamptz not null default now()
);

-- =====================================================================
-- 7. FULFILLMENT
-- =====================================================================

create table public.carriers (
  code text primary key,
  name text not null,
  tracking_url_template text
);

create table public.shipments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete restrict,
  carrier_code  text references public.carriers(code),
  tracking_number text,
  status        shipment_status not null default 'label_created',
  shipped_at    timestamptz,
  delivered_at  timestamptz,
  cost_minor    bigint,
  currency_code char(3),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.shipments (order_id);

create table public.shipment_items (
  shipment_id   uuid not null references public.shipments(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  quantity      int not null check (quantity > 0),
  primary key (shipment_id, order_item_id)
);

create table public.shipment_events (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status      shipment_status not null,
  location    text,
  message     text,
  occurred_at timestamptz not null default now()
);

-- =====================================================================
-- 8. SUBSCRIPTIONS (BA Medical+)
-- =====================================================================

create table public.subscription_plans (
  id            uuid primary key default gen_random_uuid(),
  slug          citext unique not null,
  name          text not null,
  description   text,
  price_minor   bigint not null,
  currency_code char(3) not null default 'TND',
  interval_days int not null,      -- 30, 90...
  perks         jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true
);

create table public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_id     uuid references public.subscription_plans(id),
  status      subscription_status not null default 'active',
  started_at  timestamptz not null default now(),
  paused_at   timestamptz,
  cancelled_at timestamptz,
  next_delivery_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.subscriptions (user_id);

create table public.subscription_items (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete restrict,
  variant_id      uuid references public.product_variants(id),
  quantity        int not null default 1 check (quantity > 0)
);

create table public.subscription_deliveries (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  order_id        uuid unique references public.orders(id),
  scheduled_for   timestamptz not null,
  fulfilled_at    timestamptz,
  status          text not null default 'scheduled'
);

-- =====================================================================
-- 9. MARKETING (promotions, coupons)
-- =====================================================================

create table public.promotions (
  id            uuid primary key default gen_random_uuid(),
  code          text unique,             -- optional public code
  name          text not null,
  kind          promo_kind not null,
  value_minor   bigint,                  -- for fixed_amount
  percent       numeric(5,2),            -- for percent
  min_subtotal_minor bigint,
  starts_at     timestamptz not null default now(),
  ends_at       timestamptz,
  usage_limit   int,
  per_user_limit int,
  is_active     boolean not null default true,
  scope         jsonb not null default '{}'::jsonb,  -- {categories:[], brands:[], products:[]}
  created_at    timestamptz not null default now()
);

create table public.coupons (
  id           uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  code         text unique not null,
  issued_to    uuid references auth.users(id),
  used_count   int not null default 0,
  max_uses     int not null default 1,
  expires_at   timestamptz
);

create table public.coupon_redemptions (
  id         uuid primary key default gen_random_uuid(),
  coupon_id  uuid not null references public.coupons(id) on delete restrict,
  order_id   uuid not null references public.orders(id) on delete cascade,
  user_id    uuid references auth.users(id),
  amount_minor bigint not null,
  redeemed_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

-- =====================================================================
-- 10. RELATIONSHIPS (reviews, wishlist, advisor)
-- =====================================================================

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  order_item_id uuid references public.order_items(id),      -- verified purchase
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_verified boolean not null default false,
  is_approved boolean not null default false,
  helpful_count int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id)
);
create index on public.reviews (product_id, is_approved);

create table public.review_media (
  id        uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  media_id  uuid not null references public.media_library(id) on delete restrict
);

create table public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'Ma liste',
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  added_at    timestamptz not null default now(),
  primary key (wishlist_id, product_id)
);

create table public.advisor_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  profile       prof_profile,
  age_group     text,
  conditions    text[] not null default '{}',   -- 'hypertension','diabetes'...
  interests     text[] not null default '{}',
  updated_at    timestamptz not null default now()
);

-- =====================================================================
-- 11. NOTIFICATIONS & SUPPORT
-- =====================================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  channel     notif_channel not null default 'in_app',
  title       text not null,
  body        text,
  href        text,
  read_at     timestamptz,
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

create table public.support_tickets (
  id           uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  user_id      uuid not null references auth.users(id) on delete restrict,
  order_id     uuid references public.orders(id),
  subject      text not null,
  status       ticket_status not null default 'open',
  assigned_to  uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create table public.ticket_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  author_id  uuid not null references auth.users(id),
  body       text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.ticket_attachments (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  media_id   uuid not null references public.media_library(id)
);

-- =====================================================================
-- 12. CONTENT (blog) & SEO
-- =====================================================================

create table public.blog_categories (
  id    uuid primary key default gen_random_uuid(),
  slug  citext unique not null,
  name  text not null
);

create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         citext unique not null,
  title        text not null,
  excerpt      text,
  content_md   text,
  cover_media_id uuid references public.media_library(id),
  author_id    uuid references auth.users(id),
  category_id  uuid references public.blog_categories(id),
  reading_minutes int,
  is_published boolean not null default false,
  published_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content_md,'')), 'C')
  ) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.blog_posts using gin (search_vector);

create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id  uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Generic SEO metadata table. entity_type + entity_id, polymorphic.
create table public.seo_metadata (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null,        -- 'product','category','brand','blog_post','page'
  entity_id    uuid not null,
  locale       text not null default 'fr-TN',
  title        text,
  description  text,
  canonical_url text,
  og_image_url text,
  robots       text default 'index,follow',
  json_ld      jsonb,
  updated_at   timestamptz not null default now(),
  unique (entity_type, entity_id, locale)
);

-- =====================================================================
-- 13. OBSERVABILITY (audit, events, settings, embeddings, recos)
-- =====================================================================

create table public.audit_logs (          -- APPEND-ONLY, immuable
  id          bigserial primary key,
  actor_id    uuid references auth.users(id),
  action      audit_action not null,
  entity_type text not null,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index on public.audit_logs (entity_type, entity_id);
create index on public.audit_logs (actor_id, created_at desc);

create table public.settings (
  key         text primary key,
  value       jsonb not null,
  scope       text not null default 'global',
  updated_by  uuid references auth.users(id),
  updated_at  timestamptz not null default now()
);

-- Analytics events — high write volume, partition by month later.
create table public.events (
  id           bigserial primary key,
  name         text not null,           -- 'product_view','add_to_cart','checkout_start'...
  user_id      uuid references auth.users(id),
  session_id   text,
  entity_type  text,
  entity_id    uuid,
  properties   jsonb not null default '{}'::jsonb,
  occurred_at  timestamptz not null default now()
);
create index on public.events (name, occurred_at desc);
create index on public.events (user_id, occurred_at desc) where user_id is not null;

-- Vector embeddings (structure prête, extension activée quand utilisée).
create table public.embeddings (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id   uuid not null,
  model       text not null,
  -- embedding vector(1536),   -- enable when pgvector is on
  embedding_json jsonb,        -- fallback until pgvector
  created_at  timestamptz not null default now(),
  unique (entity_type, entity_id, model)
);

create table public.recommendations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  kind         text not null,       -- 'similar','fbt','for_you','pack'
  seed_entity_type text,
  seed_entity_id   uuid,
  target_product_id uuid not null references public.products(id) on delete cascade,
  score        numeric(6,4) not null,
  reason       text,
  generated_at timestamptz not null default now()
);
create index on public.recommendations (user_id, kind, score desc);
create index on public.recommendations (seed_entity_type, seed_entity_id, score desc);

-- =====================================================================
-- 14. GRANTS + RLS (canonical block — repeated per table in real migrations)
-- =====================================================================
-- Below is the template applied to *every* public table. In real
-- migrations, each CREATE TABLE is followed immediately by its own
-- GRANT/ENABLE RLS/POLICIES block. Kept here as one section for
-- readability of this design document.

-- Example: products (public read, staff/admin write)
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;   -- policy restricts
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products_read_public" on public.products for select
  using (deleted_at is null and is_active);
create policy "products_write_staff" on public.products for all
  to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'staff'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'staff'));

-- Example: orders (customer sees own, staff/admin see all)
grant select, insert on public.orders to authenticated;
grant update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders_owner_read"  on public.orders for select to authenticated
  using (customer_id = auth.uid()
      or public.has_role(auth.uid(),'admin')
      or public.has_role(auth.uid(),'staff'));
create policy "orders_owner_insert" on public.orders for insert to authenticated
  with check (customer_id = auth.uid());
create policy "orders_staff_update" on public.orders for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'staff'));

-- Example: profiles (self-only, admin all)
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_self" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "profiles_self_write" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Example: user_roles (auth-only, no anon; managed via SECURITY DEFINER)
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "user_roles_self_read" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- Full grant/policy matrix per table lives in migrations (see strategy).

-- =====================================================================
-- 15. Triggers (updated_at)
-- =====================================================================
-- Applied per table:
--   create trigger trg_<table>_updated
--     before update on public.<table>
--     for each row execute function public.set_updated_at();
-- =====================================================================
