create or replace function public.handle_new_users()
returns trigger
language plpgsql
security definer
as $$
declare
  resolved_username text;
  resolved_first_name text;
  resolved_last_name text;
begin
  if new.is_anonymous then
    insert into public.profiles (id, role, created_at, updated_at)
    values (new.id, 'user', now(), now());
    return new;
  end if;

  resolved_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'preferred_username'), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );

  resolved_first_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'given_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), '')
  );

  resolved_last_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'family_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), '')
  );

  insert into public.profiles (id, username, first_name, last_name, email, role, created_at, updated_at)
  values (
    new.id,
    resolved_username,
    resolved_first_name,
    resolved_last_name,
    new.email,
    'client',
    now(),
    now()
  );

  return new;
end;
$$;

update public.profiles p
set
  username = coalesce(
    nullif(trim(p.username), ''),
    nullif(trim(u.raw_user_meta_data ->> 'username'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'preferred_username'), ''),
    split_part(coalesce(u.email, ''), '@', 1)
  ),
  first_name = coalesce(
    nullif(trim(p.first_name), ''),
    nullif(trim(u.raw_user_meta_data ->> 'given_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'first_name'), '')
  ),
  last_name = coalesce(
    nullif(trim(p.last_name), ''),
    nullif(trim(u.raw_user_meta_data ->> 'family_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'last_name'), '')
  ),
  updated_at = now()
from auth.users u
where p.id = u.id
  and not coalesce(u.is_anonymous, false)
  and (
    nullif(trim(p.username), '') is null
    or nullif(trim(p.first_name), '') is null
    or nullif(trim(p.last_name), '') is null
  );