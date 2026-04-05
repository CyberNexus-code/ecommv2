alter table public.items
  add column if not exists price_reviewed_at timestamp with time zone;

update public.items
set price_reviewed_at = coalesce(price_reviewed_at, updated_at, created_at, now())
where price_reviewed_at is null;

alter table public.items
  alter column price_reviewed_at set default now(),
  alter column price_reviewed_at set not null;

create index if not exists idx_items_price_reviewed_at on public.items using btree (price_reviewed_at);