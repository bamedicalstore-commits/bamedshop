-- Trigger-only function: no privileged table access is required.
-- SECURITY INVOKER removes unnecessary SECURITY DEFINER exposure.
alter function public.enforce_order_shipping_authority() security invoker;
