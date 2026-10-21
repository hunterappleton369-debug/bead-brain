-- Child Phenoms: what a family bought on the free-abacus order form (the kit, and the $27 Playbook add-on).
-- One row per email they ordered with. The parent signs in to the app with that same email (magic link),
-- and row-level security lets them read their own row and nothing else. Nobody writes it from the browser:
-- Hunter fills it in from the order (Supabase → Table Editor → purchases), or a checkout webhook does later.
-- The app reads it in js/membership.js: playbook = true opens #/playbook (members of Child Phenom University
-- get the Playbook too, without a row here). Steps: docs/APP-DELIVERY.md.
-- Apply after supabase/schema.sql, with the Supabase MCP connector (apply_migration) or the SQL editor.

create table if not exists public.purchases (
  email        text primary key,               -- lower case, exactly as on the order
  kit          boolean not null default true,  -- the free abacus kit (abacus + welcome card), shipping paid
  playbook     boolean not null default false, -- the $27 order bump: Child Prodigy Secrets Playbook (printed + audiobook + digital)
  kit_paid_at  date,                           -- the day the order went through
  order_ref    text,                           -- the order or payment id, for finding it again; the parent cannot read this column
  note         text,                           -- anything for Hunter; the parent cannot read this column
  updated_at   timestamptz default now()
);

-- Keep emails lower case so they match what the sign-in sends.
create or replace function public.purchases_tidy()
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
revoke execute on function public.purchases_tidy() from public, anon, authenticated;

drop trigger if exists purchases_tidy on public.purchases;
create trigger purchases_tidy
  before insert or update on public.purchases
  for each row execute function public.purchases_tidy();

alter table public.purchases enable row level security;

-- A signed-in parent reads the row for the email they signed in with. No insert, update or delete
-- policies: the browser cannot change a purchase. The dashboard and the service role still can.
drop policy if exists "buyers read own row" on public.purchases;
create policy "buyers read own row" on public.purchases
  for select to authenticated
  using (email = lower((select auth.jwt() ->> 'email')));

-- Parents can read only these columns: order_ref and note stay private to the dashboard.
revoke all on public.purchases from anon, authenticated;
grant select (email, kit, playbook, kit_paid_at, updated_at)
  on public.purchases to authenticated;

-- ───────── Examples (run in the SQL editor; change the email and date) ─────────
-- Free kit only (ordered 2026-10-21):
--   insert into public.purchases (email, kit, playbook, kit_paid_at, order_ref)
--   values ('parent@example.com', true, false, '2026-10-21', 'order-1001');
-- Free kit plus the $27 Playbook (or add the Playbook to an existing row):
--   insert into public.purchases (email, kit, playbook, kit_paid_at, order_ref)
--   values ('parent@example.com', true, true, '2026-10-21', 'order-1002')
--   on conflict (email) do update set playbook = true;
