create table if not exists public.oauth_provider_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oauth_provider_tokens_provider_check check (provider in ('google'))
);

alter table public.oauth_provider_tokens enable row level security;

drop policy if exists oauth_provider_tokens_select_own_or_admin on public.oauth_provider_tokens;
create policy oauth_provider_tokens_select_own_or_admin
on public.oauth_provider_tokens
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists oauth_provider_tokens_insert_own_or_admin on public.oauth_provider_tokens;
create policy oauth_provider_tokens_insert_own_or_admin
on public.oauth_provider_tokens
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists oauth_provider_tokens_update_own_or_admin on public.oauth_provider_tokens;
create policy oauth_provider_tokens_update_own_or_admin
on public.oauth_provider_tokens
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop trigger if exists oauth_provider_tokens_set_updated_at on public.oauth_provider_tokens;
create trigger oauth_provider_tokens_set_updated_at
before update on public.oauth_provider_tokens
for each row execute function public.set_updated_at();