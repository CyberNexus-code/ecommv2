-- One-off production data wipe.
--
-- Purpose:
-- - Clear all application data from the public schema
-- - Clear auth user data for a true fresh start
-- - Clear storage object metadata while preserving bucket configuration
-- - Preserve schema, policies, extensions, and migration history
--
-- Do not add this file to Supabase migrations or run it as part of deployment automation.

begin;

set local lock_timeout = '10s';
set local statement_timeout = 0;

truncate table
  public.app_logs,
  public.basket_items,
  public.baskets,
  public.business_settings,
  public.categories,
  public.item_images,
  public.items,
  public.items_tags,
  public.oauth_provider_tokens,
  public.order_items,
  public.orders,
  public.payments,
  public.profiles,
  public.tags
restart identity cascade;

do $$
declare
  auth_table text;
begin
  foreach auth_table in array array[
    'mfa_amr_claims',
    'mfa_challenges',
    'mfa_factors',
    'one_time_tokens',
    'sessions',
    'refresh_tokens',
    'identities',
    'flow_state',
    'audit_log_entries',
    'users'
  ]
  loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'auth'
        and table_name = auth_table
    ) then
      execute format('delete from auth.%I', auth_table);
    end if;
  end loop;
end $$;

commit;

-- Notes:
-- 1. This script does not touch storage.objects. Hosted Supabase blocks direct SQL deletion there.
-- 2. Empty the product-images bucket from the Supabase Storage UI or via the Storage API after
--    running this SQL if you want the uploaded files removed as well.
-- 3. This preserves storage.buckets so the product-images bucket configuration still exists.
-- 4. After this reset there will be no users and no admin. Create your first account, then run
--    scripts/ops/promote-profile-admin.sql to restore dashboard access.
-- 5. Public app tables are truncated with identity reset. Supabase-managed auth tables are deleted
--    row-by-row because hosted platform sequences are not always owned by the SQL editor role.