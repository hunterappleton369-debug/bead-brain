-- Child Phenoms: who is a Phenom University member (the flag the member library and the account page read).
-- One row per email a parent paid with. The parent signs in to the app with that same email (magic link),
-- and row-level security lets them read their own row and nothing else. Nobody writes it from the browser:
-- Hunter fills it in from the Stripe dashboard (Supabase → Table Editor → memberships), or a Stripe webhook
-- does later. Steps and examples: docs/APP-DELIVERY.md.
-- Apply after supabase/schema.sql, with the Supabase MCP connector (apply_migration) or the SQL editor.

create table if not exists public.memberships (
  email               text primary key,              -- lower case, exactly as on the Stripe customer
  status              text not null default 'trialing'
                      check (status in ('trialing', 'active', 'past_due', 'paused', 'canceled')),
  plan                text not null default 'university'
                      check (plan in ('university', 'instructor')),  -- instructor = the free year that comes with certification
  trial_end           date,                          -- the day the first $67 charge happens (Stripe: "Trial ends")
  current_period_end  date,                          -- next renewal date, or the day access ends after a cancel
  cancel_at           date,                          -- set when they cancelled but still have paid or free days left
  paused_until        date,                          -- set while a one-month pause runs (ops-runbook §3.8)
  keeps_library       boolean not null default true, -- the Prodigy Secrets Program stays after a cancel (the funnel promise)
  stripe_customer_id  text,                          -- cus_..., for finding them in Stripe
  note                text,                          -- anything for Hunter; the parent cannot read this column
  updated_at          timestamptz not null default now()
);

-- Keep emails lower case so they match what the sign-in sends.
create or replace function public.memberships_tidy()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email := lower(trim(new.email));
  new.updated_at := now();
  return new;
end;
$$;
revoke execute on function public.memberships_tidy() from public, anon, authenticated;

drop trigger if exists memberships_tidy on public.memberships;
create trigger memberships_tidy
  before insert or update on public.memberships
  for each row execute function public.memberships_tidy();

alter table public.memberships enable row level security;

-- A signed-in parent reads the row for the email they signed in with. No insert, update or delete
-- policies: the browser cannot change a membership. The dashboard and the service role still can.
drop policy if exists "members read own row" on public.memberships;
create policy "members read own row" on public.memberships
  for select to authenticated
  using (email = lower((select auth.jwt() ->> 'email')));

-- Parents can read only these columns: stripe_customer_id and note stay private to the dashboard.
revoke all on public.memberships from anon, authenticated;
grant select (email, status, plan, trial_end, current_period_end, cancel_at, paused_until, keeps_library, updated_at)
  on public.memberships to authenticated;

-- ───────── Examples (run in the SQL editor; change the email and dates) ─────────
-- New test drive (they paid on university.html today, 2026-10-21; Stripe says the trial ends 2026-11-04):
--   insert into public.memberships (email, status, trial_end, current_period_end, stripe_customer_id)
--   values ('parent@example.com', 'trialing', '2026-11-04', '2026-11-04', 'cus_...');
-- Day 14 went through (Stripe charged $67; next renewal 2026-12-04):
--   update public.memberships set status = 'active', trial_end = null, current_period_end = '2026-12-04' where email = 'parent@example.com';
-- They cancelled in the portal (access runs to the end of the period, then stops):
--   update public.memberships set cancel_at = '2026-11-04' where email = 'parent@example.com';
-- The period ran out:
--   update public.memberships set status = 'canceled' where email = 'parent@example.com';
-- One-month pause:
--   update public.memberships set status = 'paused', paused_until = '2026-12-04' where email = 'parent@example.com';
-- Certified instructor (one free year of the trainer):
--   insert into public.memberships (email, status, plan, current_period_end) values ('teacher@example.com', 'active', 'instructor', '2027-10-21');
