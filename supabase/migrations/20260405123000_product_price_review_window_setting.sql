alter table public.business_settings
  add column if not exists product_price_review_window_days integer;

update public.business_settings
set product_price_review_window_days = coalesce(product_price_review_window_days, 90)
where id = 1;

alter table public.business_settings
  alter column product_price_review_window_days set default 90;