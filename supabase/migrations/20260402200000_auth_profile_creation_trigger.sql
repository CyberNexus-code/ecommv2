drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_users();

insert into public.profiles (id, username, email, role, created_at, updated_at)
select
  u.id,
  u.raw_user_meta_data ->> 'username',
  u.email,
  case when u.is_anonymous then 'user' else 'client' end,
  coalesce(u.created_at, now()),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;