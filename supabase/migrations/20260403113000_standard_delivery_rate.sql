alter table public.business_settings
  add column if not exists standard_delivery_rate numeric(10,2) not null default 0;

update public.business_settings
set standard_delivery_rate = coalesce(standard_delivery_rate, 0)
where id = 1;

alter table public.orders
  add column if not exists subtotal numeric(10,2) not null default 0,
  add column if not exists delivery_fee numeric(10,2) not null default 0;

update public.orders o
set
  subtotal = coalesce(order_totals.subtotal, o.total, 0),
  delivery_fee = greatest(coalesce(o.total, 0) - coalesce(order_totals.subtotal, 0), 0),
  total = coalesce(o.total, coalesce(order_totals.subtotal, 0), 0)
from (
  select order_id, coalesce(sum(line_total), 0)::numeric(10,2) as subtotal
  from public.order_items
  group by order_id
) as order_totals
where order_totals.order_id = o.id;

update public.orders
set
  subtotal = coalesce(subtotal, total, 0),
  delivery_fee = coalesce(delivery_fee, 0),
  total = coalesce(total, subtotal, 0)
where subtotal is null or delivery_fee is null or total is null;

create or replace function public.create_order_items_from_basket(p_basket_id uuid, p_order_id uuid)
returns numeric
language plpgsql
as $$
declare
  v_order_subtotal numeric;
begin
  delete from public.order_items
  where order_id = p_order_id;

  insert into public.order_items(
    id,
    order_id,
    item_name,
    item_id,
    quantity,
    unit_price,
    line_total,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    p_order_id,
    i.name,
    bi.item_id,
    bi.quantity,
    i.price,
    bi.quantity * i.price,
    now(),
    now()
  from public.basket_items bi
  join public.items i on bi.item_id = i.id
  where bi.basket_id = p_basket_id;

  select coalesce(sum(line_total), 0)
  into v_order_subtotal
  from public.order_items
  where order_id = p_order_id;

  return coalesce(v_order_subtotal, 0)::numeric(10,2);
end;
$$;

create or replace function public.handle_basket_status_change()
returns trigger
language plpgsql
as $$
declare
  v_order_id uuid;
  v_subtotal numeric;
  v_delivery_fee numeric;
begin
  if new.status is distinct from old.status then
    if new.status = 'order_placed_pending_payment' then
      insert into public.orders (
        basket_id,
        user_id,
        status
      )
      values (
        new.id,
        new.user_id,
        new.status
      )
      on conflict (basket_id)
      do nothing
      returning id into v_order_id;

      if v_order_id is null then
        select id into v_order_id
        from public.orders
        where basket_id = new.id;
      end if;

      v_subtotal := public.create_order_items_from_basket(new.id, v_order_id);

      select coalesce(standard_delivery_rate, 0)
      into v_delivery_fee
      from public.business_settings
      where id = 1;

      update public.orders
      set
        subtotal = coalesce(v_subtotal, 0),
        delivery_fee = coalesce(v_delivery_fee, 0),
        total = coalesce(v_subtotal, 0) + coalesce(v_delivery_fee, 0)
      where id = v_order_id;
    else
      update public.orders
      set status = new.status
      where basket_id = new.id;
    end if;
  end if;

  return new;
end;
$$;