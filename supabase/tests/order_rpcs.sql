begin;

select plan(8);

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
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'open'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', 'open'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '11111111-1111-4111-8111-111111111111', 'closed'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '44444444-4444-4444-8444-444444444444', 'open');

insert into public.basket_items (id, basket_id, item_id, quantity)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '66666666-6666-4666-8666-666666666666', 2),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '66666666-6666-4666-8666-666666666666', 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '66666666-6666-4666-8666-666666666666', 1);

select pg_temp.authenticate_as('11111111-1111-4111-8111-111111111111');

select lives_ok(
  $$ select public.place_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'::uuid); $$,
  'place_order succeeds for the owner open basket with items'
);

select is(
  (select status from public.baskets where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  'order_placed_pending_payment',
  'place_order updates basket status'
);

select is(
  (select count(*)::integer from public.orders where basket_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  1,
  'place_order creates one order for the basket'
);

select is(
  (select count(*)::integer from public.order_items where order_id = (select id from public.orders where basket_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1')),
  1,
  'place_order copies basket items into order_items'
);

select is(
  pg_temp.capture_error($$ select public.place_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid); $$),
  'Cannot place order for an empty basket',
  'place_order rejects empty baskets'
);

select pg_temp.authenticate_as('22222222-2222-4222-8222-222222222222');

select is(
  pg_temp.capture_error($$ select public.place_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'::uuid); $$),
  'Forbidden basket access',
  'place_order rejects access to another user basket'
);

select pg_temp.authenticate_as('11111111-1111-4111-8111-111111111111');

select is(
  pg_temp.capture_error($$ select public.place_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'::uuid); $$),
  'Basket is not open',
  'place_order rejects baskets that are not open'
);

select pg_temp.authenticate_as('44444444-4444-4444-8444-444444444444');

select is(
  pg_temp.capture_error($$ select public.place_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'::uuid); $$),
  'Account is deleted or inactive',
  'place_order rejects deleted accounts'
);

select * from finish();

rollback;