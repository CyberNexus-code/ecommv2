-- Prevent soft-deleted accounts from continuing normal app activity.

create or replace function public.is_active_account()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_deleted = false
  );
$$;

-- Baskets
drop policy if exists baskets_select_own_or_admin on public.baskets;
drop policy if exists baskets_insert_own_or_admin on public.baskets;
drop policy if exists baskets_update_own_or_admin on public.baskets;
drop policy if exists baskets_delete_own_or_admin on public.baskets;

create policy baskets_select_own_or_admin
on public.baskets
for select
to authenticated
using ((user_id = auth.uid() and public.is_active_account()) or public.is_admin());

create policy baskets_insert_own_or_admin
on public.baskets
for insert
to authenticated
with check ((user_id = auth.uid() and public.is_active_account()) or public.is_admin());

create policy baskets_update_own_or_admin
on public.baskets
for update
to authenticated
using ((user_id = auth.uid() and public.is_active_account()) or public.is_admin())
with check ((user_id = auth.uid() and public.is_active_account()) or public.is_admin());

create policy baskets_delete_own_or_admin
on public.baskets
for delete
to authenticated
using ((user_id = auth.uid() and public.is_active_account()) or public.is_admin());

-- Basket items
drop policy if exists basket_items_select_own_or_admin on public.basket_items;
drop policy if exists basket_items_insert_own_or_admin on public.basket_items;
drop policy if exists basket_items_update_own_or_admin on public.basket_items;
drop policy if exists basket_items_delete_own_or_admin on public.basket_items;

create policy basket_items_select_own_or_admin
on public.basket_items
for select
to authenticated
using (
  exists (
    select 1
    from public.baskets b
    where b.id = basket_items.basket_id
      and ((b.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
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
      and ((b.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
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
      and ((b.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.baskets b
    where b.id = basket_items.basket_id
      and ((b.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
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
      and ((b.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
  )
);

-- Orders
drop policy if exists orders_select_own_or_admin on public.orders;
drop policy if exists orders_insert_own_or_admin on public.orders;
drop policy if exists orders_update_own_or_admin on public.orders;

create policy orders_select_own_or_admin
on public.orders
for select
to authenticated
using ((user_id = auth.uid() and public.is_active_account()) or public.is_admin());

create policy orders_insert_own_or_admin
on public.orders
for insert
to authenticated
with check ((user_id = auth.uid() and public.is_active_account()) or public.is_admin());

create policy orders_update_own_or_admin
on public.orders
for update
to authenticated
using ((user_id = auth.uid() and public.is_active_account()) or public.is_admin())
with check ((user_id = auth.uid() and public.is_active_account()) or public.is_admin());

-- Order items
drop policy if exists order_items_select_own_or_admin on public.order_items;
drop policy if exists order_items_insert_own_or_admin on public.order_items;

create policy order_items_select_own_or_admin
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and ((o.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
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
      and ((o.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
  )
);

-- Payments
drop policy if exists payments_select_own_or_admin on public.payments;

create policy payments_select_own_or_admin
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and ((o.user_id = auth.uid() and public.is_active_account()) or public.is_admin())
  )
);
