begin;

select plan(8);

create or replace function pg_temp.create_user(
  p_id uuid,
  p_email text,
  p_role text default 'client'
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

  insert into public.profiles (id, role, email)
  values (p_id, p_role, p_email)
  on conflict (id) do update
  set role = excluded.role, email = excluded.email, updated_at = now();
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

select pg_temp.create_user('22222222-2222-4222-8222-222222222222', 'client@example.com');
select pg_temp.create_user('33333333-3333-4333-8333-333333333333', 'admin@example.com', 'admin');

insert into public.categories (id, name)
values ('55555555-5555-4555-8555-555555555555', 'Test Category');

insert into public.items (id, category_id, name, price, quantity)
values ('66666666-6666-4666-8666-666666666666', '55555555-5555-4555-8555-555555555555', 'Cake Topper', 12.50, 100);

insert into public.tags (id, name, slug)
values ('77777777-7777-4777-8777-777777777777', 'Birthday', 'birthday');

insert into public.items_tags (item_id, tag_id)
values ('66666666-6666-4666-8666-666666666666', '77777777-7777-4777-8777-777777777777');

select pg_temp.authenticate_as('22222222-2222-4222-8222-222222222222');

select is((select count(*)::integer from public.tags), 1, 'non-admin users can read tags');
select is((select count(*)::integer from public.items_tags), 1, 'non-admin users can read item-tag relationships');
select is(
  pg_temp.capture_error($$ insert into public.tags (id, name, slug) values ('88888888-8888-4888-8888-888888888888'::uuid, 'Wedding', 'wedding'); $$),
  'new row violates row-level security policy for table "tags"',
  'non-admin users cannot insert tags'
);

select pg_temp.authenticate_as('33333333-3333-4333-8333-333333333333');

select lives_ok(
  $$ insert into public.tags (id, name, slug) values ('88888888-8888-4888-8888-888888888888'::uuid, 'Wedding', 'wedding'); $$,
  'admins can insert tags'
);
select lives_ok(
  $$ insert into public.items_tags (item_id, tag_id) values ('66666666-6666-4666-8666-666666666666'::uuid, '88888888-8888-4888-8888-888888888888'::uuid); $$,
  'admins can insert item-tag relationships'
);
select is((select count(*)::integer from public.tags), 2, 'admin insert is visible through tags table');
select is((select count(*)::integer from public.items_tags), 2, 'admin insert is visible through items_tags table');

select pg_temp.authenticate_as('22222222-2222-4222-8222-222222222222');

delete from public.tags where id = '77777777-7777-4777-8777-777777777777'::uuid;

select is(
  (select count(*)::integer from public.tags where id = '77777777-7777-4777-8777-777777777777'),
  1,
  'non-admin users cannot delete tags'
);

select * from finish();

rollback;