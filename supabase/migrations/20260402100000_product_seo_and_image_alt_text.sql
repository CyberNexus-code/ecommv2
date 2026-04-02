alter table public.items
  add column if not exists meta_title text,
  add column if not exists meta_description text;

alter table public.item_images
  add column if not exists alt_text text;

update public.item_images ii
set alt_text = i.name
from public.items i
where i.id = ii.item_id
  and (ii.alt_text is null or btrim(ii.alt_text) = '');

create index if not exists idx_items_meta_title on public.items using btree (meta_title);