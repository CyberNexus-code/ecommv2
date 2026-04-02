begin;

select plan(10);

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

create or replace function pg_temp.capture_error(p_sql text)
returns text
language plpgsql
as $$
begin
  execute p_sql;
  return null;
exception
  when others then
    return sqlerrm;
end;
$$;

select pg_temp.create_user('11111111-1111-4111-8111-111111111111', 'owner@example.com');
select pg_temp.create_user('22222222-2222-4222-8222-222222222222', 'other@example.com');
select pg_temp.create_user('33333333-3333-4333-8333-333333333333', 'admin@example.com', 'admin');
select pg_temp.create_user('44444444-4444-4444-8444-444444444444', 'deleted@example.com', 'client', true);

insert into public.categories (id, name)
values ('55555555-5555-4555-8555-555555555555', 'Test Category');

insert into public.items (id, category_id, name, price, quantity)
values (
  '66666666-6666-4666-8666-666666666666',
  '55555555-5555-4555-8555-555555555555',
  'Cake Topper',
  12.50,
  100
);

insert into public.baskets (id, user_id, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'order_placed_pending_payment'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 'open'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '44444444-4444-4444-8444-444444444444', 'open');

insert into public.orders (id, basket_id, user_id, status, total)
values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'order_placed_pending_payment', 25.00),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 'open', 12.50),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '44444444-4444-4444-8444-444444444444', 'open', 12.50);

insert into public.order_items (id, order_id, item_id, quantity, unit_price, line_total, item_name)
values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1', '66666666-6666-4666-8666-666666666666', 2, 12.50, 25.00, 'Cake Topper'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2', '66666666-6666-4666-8666-666666666666', 1, 12.50, 12.50, 'Cake Topper'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd3', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3', '66666666-6666-4666-8666-666666666666', 1, 12.50, 12.50, 'Cake Topper');

select pg_temp.authenticate_as('11111111-1111-4111-8111-111111111111');

select is((select count(*)::integer from public.baskets), 1, 'owner can read only their own basket rows');
select is((select count(*)::integer from public.orders), 1, 'owner can read only their own order rows');

select pg_temp.authenticate_as('22222222-2222-4222-8222-222222222222');

select is((select count(*)::integer from public.baskets where user_id = '11111111-1111-4111-8111-111111111111'), 0, 'non-owner cannot read another user basket');
select is((select count(*)::integer from public.orders where user_id = '11111111-1111-4111-8111-111111111111'), 0, 'non-owner cannot read another user order');
select is((select count(*)::integer from public.order_items where order_id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'), 0, 'non-owner cannot read another user order items');
select is(
  pg_temp.capture_error($$ insert into public.baskets (id, user_id, status) values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'open'); $$),
  'new row violates row-level security policy for table "baskets"',
  'non-owner cannot insert a basket for another user'
);

select pg_temp.authenticate_as('33333333-3333-4333-8333-333333333333');

select is((select count(*)::integer from public.baskets), 3, 'admin can read all basket rows');
select is((select count(*)::integer from public.orders), 3, 'admin can read all order rows');

select pg_temp.authenticate_as('44444444-4444-4444-8444-444444444444');

select is((select count(*)::integer from public.baskets where user_id = '44444444-4444-4444-8444-444444444444'), 0, 'deleted users cannot read their own basket rows');
select is(
  pg_temp.capture_error($$ insert into public.baskets (id, user_id, status) values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'open'); $$),
  'new row violates row-level security policy for table "baskets"',
  'deleted users cannot create new baskets through direct table access'
);

select * from finish();

rollback;