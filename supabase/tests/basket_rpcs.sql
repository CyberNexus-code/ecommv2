begin;

select plan(9);

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

select pg_temp.authenticate_as('11111111-1111-4111-8111-111111111111');

select is(
  (public.basket_add_item('66666666-6666-4666-8666-666666666666', 2) ->> 'quantity')::integer,
  2,
  'basket_add_item creates a basket item with requested quantity'
);

select is(
  (select count(*)::integer from public.baskets where user_id = '11111111-1111-4111-8111-111111111111' and status = 'open'),
  1,
  'get_or_create_open_basket creates one open basket for the user'
);

select is(
  (public.basket_add_item('66666666-6666-4666-8666-666666666666', 3) ->> 'quantity')::integer,
  5,
  'basket_add_item increments quantity when the item is already in the basket'
);

select is(
  (
    public.basket_set_item_quantity(
      (select id from public.baskets where user_id = '11111111-1111-4111-8111-111111111111' and status = 'open'),
      (select id from public.basket_items where item_id = '66666666-6666-4666-8666-666666666666'),
      4
    ) ->> 'quantity'
  )::integer,
  4,
  'basket_set_item_quantity updates the owner basket item quantity'
);

select is(
  jsonb_array_length(public.get_open_basket_items()),
  1,
  'get_open_basket_items returns one basket row for the authenticated user'
);

select is(
  public.get_open_basket_items() -> 0 -> 'items' ->> 'name',
  'Cake Topper',
  'get_open_basket_items includes related item details'
);

select lives_ok(
  $$
    select public.basket_remove_item(
      (select id from public.baskets where user_id = '11111111-1111-4111-8111-111111111111' and status = 'open'),
      (select id from public.basket_items where item_id = '66666666-6666-4666-8666-666666666666')
    );
  $$,
  'basket_remove_item removes an item from the owner open basket'
);

select is(
  (select count(*)::integer from public.basket_items where item_id = '66666666-6666-4666-8666-666666666666'),
  0,
  'basket_remove_item deletes the basket item row'
);

select pg_temp.authenticate_as('44444444-4444-4444-8444-444444444444');

select is(
  pg_temp.capture_error($$ select public.basket_add_item('66666666-6666-4666-8666-666666666666'::uuid, 1); $$),
  'Account is deleted or inactive',
  'deleted accounts cannot add basket items through the RPC'
);

select * from finish();

rollback;