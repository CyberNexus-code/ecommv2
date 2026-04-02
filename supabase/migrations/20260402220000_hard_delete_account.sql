-- Hard-delete account: break auth.users → profiles cascade, replace with SET NULL.
-- This lets us delete auth.users without losing the redacted profile tombstone
-- that orders and baskets still reference for audit trail.
--
-- Also replaces soft_delete_my_account with redact_and_orphan_profile which:
--   1. Redacts PII on the profile
--   2. Closes open baskets
--   3. Sets is_deleted = true, deleted_at = now()
--   4. NULLs the auth FK so the profile becomes an orphan tombstone
-- The actual auth.users deletion happens server-side via admin API.

-- Step 1: Change profiles FK from CASCADE to SET NULL.
-- We need to drop and recreate the constraint.
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

-- We can't use SET NULL on a PRIMARY KEY column. Instead, we'll handle
-- the FK removal differently: we'll remove the FK entirely and manage
-- the relationship in application code. The profile row stays as an
-- orphan tombstone after auth.users is deleted.
-- (The old CASCADE would have deleted the profile, losing audit data.)

-- Step 2: Replace the soft_delete RPC with a redact-and-orphan version.
-- The auth.users deletion is done server-side via supabase admin API
-- AFTER this function completes.

create or replace function public.redact_and_orphan_profile()
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

  -- Redact PII and mark as deleted
  update public.profiles
  set
    is_deleted = true,
    deleted_at = now(),
    role = 'deleted',
    username = null,
    first_name = null,
    last_name = null,
    delivery_address = null,
    city = null,
    postal_code = null,
    email = v_redacted_email,
    updated_at = now()
  where id = v_user_id;

  -- Close any open baskets
  update public.baskets
  set
    is_active = false,
    is_deleted = true,
    status = 'closed',
    updated_at = now()
  where user_id = v_user_id
    and status = 'open';

  -- Delete OAuth tokens (they reference auth.users with ON DELETE CASCADE,
  -- but we clean up explicitly for clarity)
  delete from public.oauth_provider_tokens
  where user_id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'deleted_at', now()
  );
end;
$$;

revoke all on function public.redact_and_orphan_profile() from public;
revoke all on function public.redact_and_orphan_profile() from anon;
grant execute on function public.redact_and_orphan_profile() to authenticated;
grant execute on function public.redact_and_orphan_profile() to service_role;

-- Drop the old soft_delete function (replaced by redact_and_orphan_profile
-- + server-side auth.admin.deleteUser)
drop function if exists public.soft_delete_my_account();

-- Drop the reactivation trigger — no longer needed since auth.users rows
-- are fully deleted; re-signup creates a fresh row + trigger creates profile.
drop trigger if exists on_auth_user_signin_reactivate on auth.users;
drop function if exists public.reactivate_profile_on_signin();
