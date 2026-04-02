create or replace function public.cleanup_stale_anonymous_accounts(retention interval default interval '30 days')
returns integer
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  stale_user_ids uuid[] := '{}';
  deleted_count integer := 0;
begin
  select coalesce(array_agg(candidate.id), '{}')
  into stale_user_ids
  from (
    select u.id
    from auth.users u
    left join public.profiles p
      on p.id = u.id
    left join lateral (
      select max(coalesce(b.updated_at, b.created_at)) as last_basket_activity
      from public.baskets b
      where b.user_id = u.id
    ) basket_activity on true
    where coalesce(u.is_anonymous, false) is true
      and not exists (
        select 1
        from public.orders o
        where o.user_id = u.id
      )
      and greatest(
        coalesce(u.last_sign_in_at, '-infinity'::timestamptz),
        coalesce(u.created_at, '-infinity'::timestamptz),
        coalesce(p.updated_at, '-infinity'::timestamptz),
        coalesce(p.created_at, '-infinity'::timestamptz),
        coalesce(basket_activity.last_basket_activity, '-infinity'::timestamptz)
      ) < now() - retention
  ) candidate;

  if array_length(stale_user_ids, 1) is null then
    return 0;
  end if;

  delete from auth.users
  where id = any(stale_user_ids);

  get diagnostics deleted_count = row_count;

  delete from public.profiles
  where id = any(stale_user_ids);

  return deleted_count;
end;
$$;

revoke all on function public.cleanup_stale_anonymous_accounts(interval) from public;
revoke all on function public.cleanup_stale_anonymous_accounts(interval) from anon;
grant execute on function public.cleanup_stale_anonymous_accounts(interval) to service_role;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'cleanup_stale_anonymous_accounts_daily';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'cleanup_stale_anonymous_accounts_daily',
    '29 3 * * *',
    $cron$select public.cleanup_stale_anonymous_accounts(interval '30 days');$cron$
  );
end;
$$;