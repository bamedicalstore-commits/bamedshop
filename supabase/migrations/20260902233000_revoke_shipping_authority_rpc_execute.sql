-- The shipping authority function is trigger-only. It must not be exposed as a PostgREST RPC.
revoke execute on function public.enforce_order_shipping_authority() from anon, authenticated;
