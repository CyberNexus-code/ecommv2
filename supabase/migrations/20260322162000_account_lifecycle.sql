-- Account lifecycle controls:
-- 1) sync profile.email when auth.users email changes
-- 2) soft delete account (anonymize profile) for audit-safe retention

alter table public.profiles
add column if not exists is_deleted boolean not null default false;

alter table public.profiles
add column if not exists deleted_at timestamp with time zone;

create or replace function public.sync_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set
      email = new.email,
      updated_at = now()
    where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.sync_profile_email_from_auth();

create or replace function public.soft_delete_my_account()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_redacted_email text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_redacted_email := 'deleted+' || replace(v_user_id::text, '-', '') || '@redacted.local';

  update public.profiles
  set
    is_deleted = true,
    deleted_at = now(),
    role = 'client',
    username = null,
    first_name = null,
    last_name = null,
    delivery_address = null,
    city = null,
    postal_code = null,
    email = v_redacted_email,
    updated_at = now()
  where id = v_user_id;

  update public.baskets
  set
    is_active = false,
    is_deleted = true,
    status = 'closed',
    updated_at = now()
  where user_id = v_user_id
    and status = 'open';

  return jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'deleted_at', now()
  );
end;
$$;

revoke all on function public.soft_delete_my_account() from public;
revoke all on function public.soft_delete_my_account() from anon;
grant execute on function public.soft_delete_my_account() to authenticated;
grant execute on function public.soft_delete_my_account() to service_role;

-- Prevent deleted users from reading/updating their own profile via normal paths.
drop policy if exists profiles_select_own_or_admin on public.profiles;
drop policy if exists profiles_update_own_or_admin on public.profiles;

create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using ((id = auth.uid() and is_deleted = false) or public.is_admin());

create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using ((id = auth.uid() and is_deleted = false) or public.is_admin())
with check ((id = auth.uid() and is_deleted = false) or public.is_admin());
