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

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('private-bucket', 'private-bucket', false);

insert into storage.objects (id, bucket_id, name, owner_id)
values
  ('99999999-9999-4999-8999-999999999991', 'product-images', 'cake-topper.png', '33333333-3333-4333-8333-333333333333'),
  ('99999999-9999-4999-8999-999999999992', 'private-bucket', 'secret.png', '33333333-3333-4333-8333-333333333333');

select pg_temp.authenticate_as('22222222-2222-4222-8222-222222222222');

select is((select count(*)::integer from storage.objects), 0, 'non-admin users cannot read storage objects via policy');
select is(
  pg_temp.capture_error($$ insert into storage.objects (id, bucket_id, name, owner_id) values ('99999999-9999-4999-8999-999999999993'::uuid, 'product-images', 'client-upload.png', '22222222-2222-4222-8222-222222222222'::uuid); $$),
  'new row violates row-level security policy for table "objects"',
  'non-admin users cannot insert product image storage objects'
);

select pg_temp.authenticate_as('33333333-3333-4333-8333-333333333333');

select is((select count(*)::integer from storage.objects), 1, 'admins only see storage objects in the product-images bucket');
select is((select name from storage.objects limit 1), 'cake-topper.png', 'admin storage read is limited to product-images bucket');
select lives_ok(
  $$ insert into storage.objects (id, bucket_id, name, owner_id) values ('99999999-9999-4999-8999-999999999994'::uuid, 'product-images', 'admin-upload.png', '33333333-3333-4333-8333-333333333333'::uuid); $$,
  'admins can insert storage objects into product-images bucket'
);
select is((select count(*)::integer from storage.objects), 2, 'admin insert into product-images bucket succeeds');
select is(
  pg_temp.capture_error($$ insert into storage.objects (id, bucket_id, name, owner_id) values ('99999999-9999-4999-8999-999999999995'::uuid, 'private-bucket', 'wrong-bucket.png', '33333333-3333-4333-8333-333333333333'::uuid); $$),
  'new row violates row-level security policy for table "objects"',
  'admins cannot insert storage objects outside the product-images bucket'
);
select is(
  pg_temp.capture_error($$ delete from storage.objects where id = '99999999-9999-4999-8999-999999999991'::uuid; $$),
  'Direct deletion from storage tables is not allowed. Use the Storage API instead.',
  'direct SQL deletes on storage.objects are blocked by the storage protection trigger'
);

select * from finish();

rollback;