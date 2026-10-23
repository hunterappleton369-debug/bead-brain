-- Child Phenoms: the 3-Night Quick-Start emails (Q1 to Q3 of marketing-sequences/10-quickstart-soap-opera.md) that
-- the stripe-webhook function sends through Resend when a kit is paid. welcome_sent_at is set the moment Q1 is
-- accepted by Resend, and the function skips a row that has it, so a Stripe retry or a re-sent event never sends
-- the sequence twice. welcome_email_ids holds Resend's three email ids (Q1, then the scheduled Q2 and Q3), so a
-- scheduled one can be cancelled in Resend (Emails → the id → Cancel) when a parent asks to stop or a kit is refunded.
-- The parent cannot read either column (purchases.sql grants them a fixed column list).
-- Apply after supabase/purchases_shopify.sql, with the Supabase MCP connector (apply_migration) or the SQL editor.

alter table public.purchases add column if not exists welcome_sent_at   timestamptz; -- when Q1 went out; empty = not sent yet
alter table public.purchases add column if not exists welcome_email_ids text;        -- Resend ids, comma separated, in send order
