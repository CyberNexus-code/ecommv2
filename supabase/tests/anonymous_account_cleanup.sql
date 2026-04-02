begin;

select plan(7);

create or replace function pg_temp.create_user(
  p_id uuid,
  p_email text,
  p_role text default 'client',
  p_is_deleted boolean default false,
  p_is_anonymous boolean default false,
  p_created_at timestamptz default now()
)
returns void
language plpgsql
as $$
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    last_sign_in_at,
    is_sso_user,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    'not-used-in-db-tests',
    p_created_at,
    '{}'::jsonb,
    '{}'::jsonb,
    p_created_at,
    p_created_at,
    p_created_at,
    false,
    p_is_anonymous
  );

  insert into public.profiles (id, role, email, is_deleted, deleted_at, created_at, updated_at)
  values (
    p_id,
    case when p_is_anonymous then 'user' else p_role end,
    p_email,
    p_is_deleted,
    case when p_is_deleted then p_created_at else null end,
    p_created_at,
    p_created_at
  )
  on conflict (id) do update
  set
    role = excluded.role,
    email = excluded.email,
    is_deleted = excluded.is_deleted,
    deleted_at = excluded.deleted_at,
    updated_at = excluded.updated_at;
end;
$$;

select pg_temp.create_user('11111111-1111-4111-8111-111111111111', 'stale-guest@example.com', 'user', false, true, now() - interval '40 days');
select pg_temp.create_user('22222222-2222-4222-8222-222222222222', 'recent-guest@example.com', 'user', false, true, now() - interval '2 days');
select pg_temp.create_user('33333333-3333-4333-8333-333333333333', 'guest-with-order@example.com', 'user', false, true, now() - interval '40 days');

insert into public.baskets (id, user_id, status, created_at, updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'open', now() - interval '40 days', now() - interval '40 days'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '33333333-3333-4333-8333-333333333333', 'closed', now() - interval '40 days', now() - interval '40 days');

insert into public.orders (id, user_id, basket_id, status, total, created_at, updated_at)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  '33333333-3333-4333-8333-333333333333',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  'completed',
  10.00,
  now() - interval '39 days',
  now() - interval '39 days'
);

select is(
  public.cleanup_stale_anonymous_accounts(interval '30 days'),
  1,
  'cleanup deletes only stale anonymous accounts without orders'
);

select is(
  (select count(*)::integer from auth.users where id = '11111111-1111-4111-8111-111111111111'),
  0,
  'stale anonymous auth user is deleted'
);

select is(
  (select count(*)::integer from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  0,
  'stale anonymous profile is deleted after auth cleanup'
);

select is(
  (select count(*)::integer from public.baskets where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  0,
  'stale anonymous baskets are removed via auth cascade'
);

select is(
  (select count(*)::integer from auth.users where id = '22222222-2222-4222-8222-222222222222'),
  1,
  'recent anonymous user is retained'
);

select is(
  (select count(*)::integer from auth.users where id = '33333333-3333-4333-8333-333333333333'),
  1,
  'anonymous user with order history is retained'
);

select is(
  (select count(*)::integer from public.profiles where id = '33333333-3333-4333-8333-333333333333'),
  1,
  'profile for anonymous user with orders is retained'
);

select * from finish();

rollback;