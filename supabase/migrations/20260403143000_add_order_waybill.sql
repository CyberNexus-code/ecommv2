alter table public.orders
  add column if not exists waybill_number text;