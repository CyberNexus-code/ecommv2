-- Reactivate soft-deleted profiles when the same user signs in again.
--
-- When a user soft-deletes their account (soft_delete_my_account), the profile
-- row stays with is_deleted = true and PII redacted. If the same user signs in
-- again — e.g. via Google OAuth which links an identity to the existing
-- auth.users row instead of creating a new one — the on_auth_user_created
-- INSERT trigger never fires and the profile remains deleted, blocking all
-- RLS-guarded operations (baskets, orders, etc.).
--
-- This trigger fires on UPDATE of last_sign_in_at on auth.users (set by
-- Supabase on every sign-in). If the profile is soft-deleted it reactivates it
-- and restores the email from auth.users.

create or replace function public.reactivate_profile_on_signin()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
begin
  -- Only act when last_sign_in_at actually changed (i.e. a real sign-in)
  if new.last_sign_in_at is distinct from old.last_sign_in_at then
    update public.profiles
    set
      is_deleted = false,
      deleted_at = null,
      email = new.email,
      updated_at = now()
    where id = new.id
      and is_deleted = true;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_signin_reactivate on auth.users;

create trigger on_auth_user_signin_reactivate
after update of last_sign_in_at on auth.users
for each row
when (old.last_sign_in_at is distinct from new.last_sign_in_at)
execute function public.reactivate_profile_on_signin();
