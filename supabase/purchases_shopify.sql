-- Child Phenoms: the Shopify order the stripe-webhook function created for a paid kit order.
-- Empty means no Shopify order exists yet (token not set, or Shopify refused it): fix the cause, then re-send the
-- Stripe event (stripe-setup.md §8, "Shopify order creation"). Filled means the order exists, so a re-sent event
-- does not make a second one. The parent cannot read either column (purchases.sql grants them a fixed column list).
-- Apply after supabase/purchases.sql, with the Supabase MCP connector (apply_migration) or the SQL editor.

alter table public.purchases add column if not exists shopify_order_id   text; -- Shopify's numeric order id
alter table public.purchases add column if not exists shopify_order_name text; -- the "#1001" name staff see in Shopify
