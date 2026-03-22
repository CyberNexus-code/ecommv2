-- Basket item RPCs: centralize cart mutations in DB logic.

create or replace function public.get_or_create_open_basket()
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_basket_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_active_account() then
    raise exception 'Account is deleted or inactive';
  end if;

  select b.id
  into v_basket_id
  from public.baskets b
  where b.user_id = v_user_id
    and b.status = 'open'
  order by b.created_at desc
  limit 1;

  if v_basket_id is null then
    insert into public.baskets (user_id, status)
    values (v_user_id, 'open')
    returning id into v_basket_id;
  end if;

  return v_basket_id;
end;
$$;

create or replace function public.basket_add_item(p_item_id uuid, p_quantity integer default 1)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_basket_id uuid;
  v_row public.basket_items%rowtype;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  if not exists (
    select 1
    from public.items i
    where i.id = p_item_id
      and i.is_active = true
      and i.is_deleted = false
  ) then
    raise exception 'Item is not available';
  end if;

  v_basket_id := public.get_or_create_open_basket();

  insert into public.basket_items (basket_id, item_id, quantity)
  values (v_basket_id, p_item_id, p_quantity)
  on conflict (basket_id, item_id)
  do update set quantity = public.basket_items.quantity + excluded.quantity
  returning * into v_row;

  return jsonb_build_object(
    'success', true,
    'basket_id', v_row.basket_id,
    'basket_item_id', v_row.id,
    'item_id', v_row.item_id,
    'quantity', v_row.quantity
  );
end;
$$;

create or replace function public.basket_set_item_quantity(
  p_basket_id uuid,
  p_basket_item_id uuid,
  p_quantity integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.basket_items%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_active_account() then
    raise exception 'Account is deleted or inactive';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  update public.basket_items bi
  set quantity = p_quantity
  where bi.id = p_basket_item_id
    and bi.basket_id = p_basket_id
    and exists (
      select 1
      from public.baskets b
      where b.id = bi.basket_id
        and b.user_id = v_user_id
        and b.status = 'open'
    )
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Basket item not found or not editable';
  end if;

  return jsonb_build_object(
    'success', true,
    'basket_id', v_row.basket_id,
    'basket_item_id', v_row.id,
    'quantity', v_row.quantity
  );
end;
$$;

create or replace function public.basket_remove_item(
  p_basket_id uuid,
  p_basket_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted_count integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_active_account() then
    raise exception 'Account is deleted or inactive';
  end if;

  with deleted_rows as (
    delete from public.basket_items bi
    where bi.id = p_basket_item_id
      and bi.basket_id = p_basket_id
      and exists (
        select 1
        from public.baskets b
        where b.id = bi.basket_id
          and b.user_id = v_user_id
          and b.status = 'open'
      )
    returning 1
  )
  select count(*) into v_deleted_count
  from deleted_rows;

  if v_deleted_count = 0 then
    raise exception 'Basket item not found or not removable';
  end if;

  return jsonb_build_object(
    'success', true,
    'basket_id', p_basket_id,
    'basket_item_id', p_basket_item_id
  );
end;
$$;

revoke all on function public.get_or_create_open_basket() from public;
revoke all on function public.basket_add_item(uuid, integer) from public;
revoke all on function public.basket_set_item_quantity(uuid, uuid, integer) from public;
revoke all on function public.basket_remove_item(uuid, uuid) from public;

revoke all on function public.get_or_create_open_basket() from anon;
revoke all on function public.basket_add_item(uuid, integer) from anon;
revoke all on function public.basket_set_item_quantity(uuid, uuid, integer) from anon;
revoke all on function public.basket_remove_item(uuid, uuid) from anon;

grant execute on function public.get_or_create_open_basket() to authenticated;
grant execute on function public.basket_add_item(uuid, integer) to authenticated;
grant execute on function public.basket_set_item_quantity(uuid, uuid, integer) to authenticated;
grant execute on function public.basket_remove_item(uuid, uuid) to authenticated;

grant execute on function public.get_or_create_open_basket() to service_role;
grant execute on function public.basket_add_item(uuid, integer) to service_role;
grant execute on function public.basket_set_item_quantity(uuid, uuid, integer) to service_role;
grant execute on function public.basket_remove_item(uuid, uuid) to service_role;
