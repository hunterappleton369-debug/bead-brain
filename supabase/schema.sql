-- Child Phenoms: parent accounts and synced progress.
-- One parent = one auth user. One row per child; progress holds the whole browser profile as JSON
-- (name, age, xp, streak, lessons, bosses, tests, bests, log, firstSteps, quest) and the client's
-- updated timestamp, so the newest copy wins when two devices disagree.
-- Apply with the Supabase MCP connector (apply_migration) or paste into the SQL editor.

create table if not exists public.parents (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id         text not null,                     -- the profile id the browser made (p + base36 time + random)
  parent_id  uuid not null references public.parents (id) on delete cascade,
  name       text not null,
  age        int,
  created_at timestamptz not null default now(),
  primary key (parent_id, id)
);

create table if not exists public.progress (
  parent_id  uuid not null,
  child_id   text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (parent_id, child_id),
  foreign key (parent_id, child_id) references public.children (parent_id, id) on delete cascade
);

-- A parents row appears the moment the auth user does (the magic link creates the user).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.parents (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Not callable through the REST RPC endpoint; only the trigger runs it.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-level security: a parent only ever sees their own rows. Signed-out visitors (anon) see nothing.
alter table public.parents  enable row level security;
alter table public.children enable row level security;
alter table public.progress enable row level security;

drop policy if exists "parents own row"    on public.parents;
drop policy if exists "children own rows"  on public.children;
drop policy if exists "progress own rows"  on public.progress;

create policy "parents own row" on public.parents
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "children own rows" on public.children
  for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

create policy "progress own rows" on public.progress
  for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

revoke all on public.parents, public.children, public.progress from anon;
