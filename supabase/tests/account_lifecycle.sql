begin;

select plan(11);

create or replace function pg_temp.create_user(
  p_id uuid,
  p_email text,
  p_role text default 'client',
  p_is_deleted boolean default false
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
    is_sso_user,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    'not-used-in-db-tests',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false,
    false
  );

  insert into public.profiles (id, role, email, is_deleted, deleted_at)
  values (p_id, p_role, p_email, p_is_deleted, case when p_is_deleted then now() else null end)
  on conflict (id) do update
  set
    role = excluded.role,
    email = excluded.email,
    is_deleted = excluded.is_deleted,
    deleted_at = excluded.deleted_at,
    updated_at = now();
end;
$$;

create or replace function pg_temp.authenticate_as(
  p_user_id uuid,
  p_role text default 'authenticated'
)
returns void
language plpgsql
as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('request.jwt.claim.role', p_role, true);
  execute format('set local role %I', p_role);
end;
$$;

select pg_temp.create_user('11111111-1111-4111-8111-111111111111', 'before@example.com');
select pg_temp.create_user('22222222-2222-4222-8222-222222222222', 'pending@example.com');

update public.profiles
set
  first_name = 'Pending',
  last_name = 'Customer',
  username = 'pending-customer',
  delivery_address = '123 Test Street',
  city = 'Durban',
  postal_code = 4001,
  updated_at = now()
where id = '22222222-2222-4222-8222-222222222222';

insert into public.categories (id, name)
values ('55555555-5555-4555-8555-555555555555', 'Lifecycle Test Category');

insert into public.items (id, category_id, name, price, quantity)
values (
  '66666666-6666-4666-8666-666666666666',
  '55555555-5555-4555-8555-555555555555',
  'Lifecycle Cake Topper',
  12.50,
  100
);

update auth.users
set email = 'after@example.com'
where id = '11111111-1111-4111-8111-111111111111';

select is(
  (select email from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'after@example.com',
  'auth user email updates sync into public.profiles'
);

insert into public.baskets (id, user_id, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'open'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', 'closed');

select pg_temp.authenticate_as('11111111-1111-4111-8111-111111111111');

select is(
  public.redact_and_orphan_profile() ->> 'success',
  'true',
  'redact_and_orphan_profile reports success for a user without active orders'
);

reset role;

select is(
  (select is_deleted::text from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'true',
  'redact_and_orphan_profile marks the profile as deleted'
);

select matches(
  (select email from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  '^deleted\+[0-9a-f]+@redacted\.local$',
  'redact_and_orphan_profile redacts the profile email'
);

select is(
  (select status from public.baskets where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  'closed',
  'redact_and_orphan_profile closes open baskets'
);

select pg_temp.authenticate_as('11111111-1111-4111-8111-111111111111');

select is(
  (select count(*)::integer from public.profiles),
  0,
  'deleted users can no longer read their own profile through RLS'
);

select is(
  public.is_active_account()::text,
  'false',
  'deleted users are no longer considered active accounts'
);

reset role;

insert into public.baskets (id, user_id, status)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '22222222-2222-4222-8222-222222222222', 'open');

insert into public.basket_items (id, basket_id, item_id, quantity)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '66666666-6666-4666-8666-666666666666', 1);

select pg_temp.authenticate_as('22222222-2222-4222-8222-222222222222');

select lives_ok(
  $$ select public.place_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'::uuid); $$,
  'place_order succeeds before account deletion for the user with an active order'
);

select is(
  public.redact_and_orphan_profile() ->> 'success',
  'true',
  'redact_and_orphan_profile also succeeds for a user with active orders'
);

reset role;

select is(
  (select customer_email from public.orders where user_id = '22222222-2222-4222-8222-222222222222' and status = 'order_placed_pending_payment' limit 1),
  'pending@example.com',
  'active order keeps its snapshotted customer email after account redaction'
);

select is(
  (select delivery_address from public.orders where user_id = '22222222-2222-4222-8222-222222222222' and status = 'order_placed_pending_payment' limit 1),
  '123 Test Street',
  'active order keeps its snapshotted delivery address after account redaction'
);

select * from finish();

rollback;