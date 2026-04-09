alter table public.business_settings
  add column if not exists order_min_days_notice integer;

update public.business_settings
set order_min_days_notice = 14
where id = 1 and order_min_days_notice is null;

alter table public.business_settings
  alter column order_min_days_notice set default 14;