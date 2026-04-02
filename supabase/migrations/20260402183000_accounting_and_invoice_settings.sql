create table if not exists public.business_settings (
  id integer primary key default 1,
  business_name text not null default 'Cute & Creative Toppers',
  business_email text,
  business_phone text,
  bank_account_name text,
  bank_name text,
  account_number text,
  branch_code text,
  account_type text,
  payment_reference_prefix text not null default 'INV',
  invoice_footer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_settings_singleton check (id = 1)
);

alter table public.business_settings enable row level security;

drop policy if exists "business_settings_select_authenticated" on public.business_settings;
create policy "business_settings_select_authenticated"
on public.business_settings
for select
to authenticated
using (true);

drop policy if exists "business_settings_insert_admin" on public.business_settings;
create policy "business_settings_insert_admin"
on public.business_settings
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "business_settings_update_admin" on public.business_settings;
create policy "business_settings_update_admin"
on public.business_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
before update on public.business_settings
for each row execute function public.set_updated_at();

insert into public.business_settings (
  id,
  business_name,
  payment_reference_prefix,
  invoice_footer_note
)
values (
  1,
  'Cute & Creative Toppers',
  'INV',
  'Payment reference: use your order or invoice number when making EFT payments.'
)
on conflict (id) do nothing;

alter table public.orders
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists delivery_address text,
  add column if not exists delivery_city text,
  add column if not exists delivery_postal_code numeric;

create or replace function public.snapshot_order_customer_details()
returns trigger
language plpgsql
as $$
declare
  v_profile public.profiles%rowtype;
  v_customer_name text;
begin
  select *
  into v_profile
  from public.profiles
  where id = new.user_id;

  v_customer_name := nullif(trim(concat_ws(' ', v_profile.first_name, v_profile.last_name)), '');

  if v_customer_name is null then
    v_customer_name := coalesce(v_profile.username, v_profile.email);
  end if;

  new.customer_name := coalesce(new.customer_name, v_customer_name);
  new.customer_email := coalesce(new.customer_email, v_profile.email);
  new.delivery_address := coalesce(new.delivery_address, v_profile.delivery_address);
  new.delivery_city := coalesce(new.delivery_city, v_profile.city);
  new.delivery_postal_code := coalesce(new.delivery_postal_code, v_profile.postal_code);

  return new;
end;
$$;

drop trigger if exists orders_snapshot_customer_details on public.orders;
create trigger orders_snapshot_customer_details
before insert on public.orders
for each row execute function public.snapshot_order_customer_details();

update public.orders o
set
  customer_name = coalesce(
    nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    p.username,
    p.email,
    o.customer_name
  ),
  customer_email = coalesce(p.email, o.customer_email),
  delivery_address = coalesce(p.delivery_address, o.delivery_address),
  delivery_city = coalesce(p.city, o.delivery_city),
  delivery_postal_code = coalesce(p.postal_code, o.delivery_postal_code)
from public.profiles p
where p.id = o.user_id;