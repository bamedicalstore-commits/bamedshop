-- 1) Lock down the trigger-only SECURITY DEFINER function
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

-- 2) Authoritative price resolution
CREATE OR REPLACE FUNCTION public.resolve_product_price(_product_id uuid, _user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p.professional_price IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.profiles pr
        WHERE pr.id = _user_id AND pr.is_ba_medical_plus
      )
    THEN p.professional_price
    ELSE p.price
  END
  FROM public.products p
  WHERE p.id = _product_id AND p.active
$$;
REVOKE ALL ON FUNCTION public.resolve_product_price(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_product_price(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.resolve_product_price(uuid, uuid) FROM authenticated;

-- 3) cart_items: always recompute unit_price server-side
CREATE OR REPLACE FUNCTION public.enforce_cart_item_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
  _price numeric;
BEGIN
  IF NEW.quantity IS NULL OR NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  SELECT user_id INTO _owner FROM public.carts WHERE id = NEW.cart_id;
  _price := public.resolve_product_price(NEW.product_id, _owner);

  IF _price IS NULL THEN
    RAISE EXCEPTION 'Product unavailable';
  END IF;

  NEW.unit_price := _price;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cart_items_price ON public.cart_items;
CREATE TRIGGER trg_cart_items_price
  BEFORE INSERT OR UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_cart_item_price();

-- 4) order_items: recompute unit_price and line_total (staff may override)
CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
  _price numeric;
BEGIN
  IF NEW.quantity IS NULL OR NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  IF public.is_staff(auth.uid()) THEN
    NEW.line_total := round(NEW.unit_price * NEW.quantity, 3);
    RETURN NEW;
  END IF;

  IF NEW.product_id IS NULL THEN
    RAISE EXCEPTION 'product_id is required';
  END IF;

  SELECT user_id INTO _owner FROM public.orders WHERE id = NEW.order_id;
  _price := public.resolve_product_price(NEW.product_id, _owner);

  IF _price IS NULL THEN
    RAISE EXCEPTION 'Product unavailable';
  END IF;

  NEW.unit_price := _price;
  NEW.line_total := round(_price * NEW.quantity, 3);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_price ON public.order_items;
CREATE TRIGGER trg_order_items_price
  BEFORE INSERT OR UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_item_price();

-- 5) orders: zero out client-supplied money on insert, then recompute from real lines
CREATE OR REPLACE FUNCTION public.enforce_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;

  NEW.subtotal := 0;
  NEW.discount_total := 0;
  NEW.shipping_cost := COALESCE(NEW.shipping_cost, 0);
  NEW.total := NEW.shipping_cost;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_totals ON public.orders;
CREATE TRIGGER trg_orders_totals
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_totals();

CREATE OR REPLACE FUNCTION public.recompute_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id uuid := COALESCE(NEW.order_id, OLD.order_id);
  _subtotal numeric;
  _discount numeric := 0;
  _coupon_code text;
  _ctype coupon_type;
  _cvalue numeric;
  _shipping numeric;
BEGIN
  SELECT COALESCE(sum(line_total), 0) INTO _subtotal
  FROM public.order_items WHERE order_id = _order_id;

  SELECT o.coupon_code, o.shipping_cost INTO _coupon_code, _shipping
  FROM public.orders o WHERE o.id = _order_id;

  IF _coupon_code IS NOT NULL THEN
    SELECT c.type, c.value INTO _ctype, _cvalue
    FROM public.coupons c
    WHERE c.code = _coupon_code
      AND c.active
      AND (c.valid_until IS NULL OR c.valid_until > now());

    IF _ctype = 'percentage' THEN
      _discount := round(_subtotal * (_cvalue / 100.0), 3);
    ELSIF _ctype = 'fixed' THEN
      _discount := least(_cvalue, _subtotal);
    END IF;
  END IF;

  UPDATE public.orders
  SET subtotal = _subtotal,
      discount_total = _discount,
      total = greatest(_subtotal - _discount + COALESCE(_shipping, 0), 0)
  WHERE id = _order_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_recompute ON public.order_items;
CREATE TRIGGER trg_order_items_recompute
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recompute_order_totals();