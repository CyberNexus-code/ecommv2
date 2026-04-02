-- Run this after the fresh-start wipe once the first real user has signed up.
-- Replace the email value below before executing.

do $$
declare
  target_email text := lower(trim('replace-me@example.com'));
  updated_count integer;
begin
  update public.profiles
  set role = 'admin',
      updated_at = now()
  where lower(email) = target_email;

  get diagnostics updated_count = row_count;

  if updated_count = 0 then
    raise exception 'No profile found for %', target_email;
  end if;
end $$;