begin;

select plan(7);

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
  public.soft_delete_my_account() ->> 'success',
  'true',
  'soft_delete_my_account reports success'
);

reset role;

select is(
  (select is_deleted::text from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'true',
  'soft_delete_my_account marks the profile as deleted'
);

select matches(
  (select email from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  '^deleted\+[0-9a-f]+@redacted\.local$',
  'soft_delete_my_account redacts the profile email'
);

select is(
  (select status from public.baskets where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  'closed',
  'soft_delete_my_account closes open baskets'
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

select * from finish();

rollback;