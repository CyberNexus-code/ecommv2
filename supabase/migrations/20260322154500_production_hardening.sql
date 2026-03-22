-- Production hardening: RLS, policy tightening, and integrity checks.

-- Keep order status consistent with its CHECK constraint.
update public.orders
set status = 'open'
where status is null or btrim(status) = '';

alter table public.orders
alter column status set default 'open';

-- Enable RLS on all application tables.
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.profiles enable row level security;
alter table public.baskets enable row level security;
alter table public.basket_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- Drop legacy/overly broad policies so we can replace them with stricter versions.
drop policy if exists "Public read" on public.categories;
drop policy if exists "Public read" on public.items;
drop policy if exists "Prevent assigning deleted categories" on public.items;

drop policy if exists categories_public_read_active on public.categories;
drop policy if exists categories_admin_write on public.categories;

drop policy if exists items_public_read_active on public.items;
drop policy if exists items_admin_insert on public.items;
drop policy if exists items_admin_update on public.items;
drop policy if exists items_admin_delete on public.items;

drop policy if exists item_images_public_read_active on public.item_images;
drop policy if exists item_images_admin_insert on public.item_images;
drop policy if exists item_images_admin_update on public.item_images;
drop policy if exists item_images_admin_delete on public.item_images;

drop policy if exists profiles_select_own_or_admin on public.profiles;
drop policy if exists profiles_update_own_or_admin on public.profiles;

drop policy if exists baskets_select_own_or_admin on public.baskets;
drop policy if exists baskets_insert_own_or_admin on public.baskets;
drop policy if exists baskets_update_own_or_admin on public.baskets;
drop policy if exists baskets_delete_own_or_admin on public.baskets;

drop policy if exists basket_items_select_own_or_admin on public.basket_items;
drop policy if exists basket_items_insert_own_or_admin on public.basket_items;
drop policy if exists basket_items_update_own_or_admin on public.basket_items;
drop policy if exists basket_items_delete_own_or_admin on public.basket_items;

drop policy if exists orders_select_own_or_admin on public.orders;
drop policy if exists orders_insert_own_or_admin on public.orders;
drop policy if exists orders_update_own_or_admin on public.orders;
drop policy if exists orders_delete_admin_only on public.orders;

drop policy if exists order_items_select_own_or_admin on public.order_items;
drop policy if exists order_items_insert_own_or_admin on public.order_items;
drop policy if exists order_items_update_admin_only on public.order_items;
drop policy if exists order_items_delete_admin_only on public.order_items;

drop policy if exists payments_select_own_or_admin on public.payments;
drop policy if exists payments_insert_admin_only on public.payments;
drop policy if exists payments_update_admin_only on public.payments;
drop policy if exists payments_delete_admin_only on public.payments;

-- Catalog policies.
create policy categories_public_read_active
on public.categories
for select
to anon, authenticated
using (is_active = true and is_deleted = false);

create policy categories_admin_write
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy items_public_read_active
on public.items
for select
to anon, authenticated
using (is_active = true and is_deleted = false);

create policy items_admin_insert
on public.items
for insert
to authenticated
with check (
  public.is_admin()
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = items.category_id
        and c.is_active = true
        and c.is_deleted = false
    )
  )
);

create policy items_admin_update
on public.items
for update
to authenticated
using (public.is_admin())
with check (
  public.is_admin()
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = items.category_id
        and c.is_active = true
        and c.is_deleted = false
    )
  )
);

create policy items_admin_delete
on public.items
for delete
to authenticated
using (public.is_admin());

create policy item_images_public_read_active
on public.item_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.items i
    where i.id = item_images.item_id
      and i.is_active = true
      and i.is_deleted = false
  )
);

create policy item_images_admin_insert
on public.item_images
for insert
to authenticated
with check (public.is_admin());

create policy item_images_admin_update
on public.item_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy item_images_admin_delete
on public.item_images
for delete
to authenticated
using (public.is_admin());

-- Profile policies.
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Basket policies.
create policy baskets_select_own_or_admin
on public.baskets
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy baskets_insert_own_or_admin
on public.baskets
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy baskets_update_own_or_admin
on public.baskets
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy baskets_delete_own_or_admin
on public.baskets
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy basket_items_select_own_or_admin
on public.basket_items
for select
to authenticated
using (
  exists (
    select 1
    from public.baskets b
    where b.id = basket_items.basket_id
      and (b.user_id = auth.uid() or public.is_admin())
  )
);

create policy basket_items_insert_own_or_admin
on public.basket_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.baskets b
    where b.id = basket_items.basket_id
      and (b.user_id = auth.uid() or public.is_admin())
  )
);

create policy basket_items_update_own_or_admin
on public.basket_items
for update
to authenticated
using (
  exists (
    select 1
    from public.baskets b
    where b.id = basket_items.basket_id
      and (b.user_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.baskets b
    where b.id = basket_items.basket_id
      and (b.user_id = auth.uid() or public.is_admin())
  )
);

create policy basket_items_delete_own_or_admin
on public.basket_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.baskets b
    where b.id = basket_items.basket_id
      and (b.user_id = auth.uid() or public.is_admin())
  )
);

-- Order policies.
create policy orders_select_own_or_admin
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy orders_insert_own_or_admin
on public.orders
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

create policy orders_update_own_or_admin
on public.orders
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy orders_delete_admin_only
on public.orders
for delete
to authenticated
using (public.is_admin());

create policy order_items_select_own_or_admin
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

create policy order_items_insert_own_or_admin
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

create policy order_items_update_admin_only
on public.order_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy order_items_delete_admin_only
on public.order_items
for delete
to authenticated
using (public.is_admin());

-- Payments policies.
create policy payments_select_own_or_admin
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

create policy payments_insert_admin_only
on public.payments
for insert
to authenticated
with check (public.is_admin());

create policy payments_update_admin_only
on public.payments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy payments_delete_admin_only
on public.payments
for delete
to authenticated
using (public.is_admin());

-- Storage policies for dashboard image management.
drop policy if exists "Authenticated user can delete 16wiy3a_0" on storage.objects;
drop policy if exists "Authenticated user can delete 16wiy3a_1" on storage.objects;
drop policy if exists "Authenticated users can upload product images" on storage.objects;
drop policy if exists storage_product_images_admin_select on storage.objects;
drop policy if exists storage_product_images_admin_insert on storage.objects;
drop policy if exists storage_product_images_admin_update on storage.objects;
drop policy if exists storage_product_images_admin_delete on storage.objects;

create policy storage_product_images_admin_select
on storage.objects
for select
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

create policy storage_product_images_admin_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

create policy storage_product_images_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

create policy storage_product_images_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- Add integrity checks without failing on legacy data.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'basket_items_quantity_positive'
      and conrelid = 'public.basket_items'::regclass
  ) then
    alter table public.basket_items
      add constraint basket_items_quantity_positive check (quantity > 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'items_price_non_negative'
      and conrelid = 'public.items'::regclass
  ) then
    alter table public.items
      add constraint items_price_non_negative check (price >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'items_quantity_non_negative'
      and conrelid = 'public.items'::regclass
  ) then
    alter table public.items
      add constraint items_quantity_non_negative check (quantity >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_quantity_positive'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_quantity_positive check (quantity > 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_unit_price_non_negative'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_unit_price_non_negative check (unit_price >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_line_total_non_negative'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_line_total_non_negative check (line_total >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_total_non_negative'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_total_non_negative check (total >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'payments_amount_non_negative'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_amount_non_negative check (amount >= 0) not valid;
  end if;
end
$$;
