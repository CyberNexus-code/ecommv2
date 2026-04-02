create or replace function public.merge_guest_account_data(p_guest_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_current_user_id uuid := auth.uid();
  v_is_anonymous boolean := coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
  v_guest_open_basket_id uuid;
  v_target_open_basket_id uuid;
  v_reassigned_order_count integer := 0;
  v_reassigned_basket_count integer := 0;
  v_merged_item_count integer := 0;
begin
  if v_current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_is_anonymous then
    raise exception 'Only permanent users can merge guest data';
  end if;

  if p_guest_user_id is null then
    raise exception 'Guest user id is required';
  end if;

  if p_guest_user_id = v_current_user_id then
    return jsonb_build_object(
      'success', true,
      'merged', false,
      'reason', 'same-user'
    );
  end if;

  if not exists (
    select 1
    from auth.users
    where id = p_guest_user_id
      and is_anonymous is true
  ) then
    raise exception 'Guest account not found';
  end if;

  update public.orders
  set
    user_id = v_current_user_id,
    updated_at = now()
  where user_id = p_guest_user_id;

  get diagnostics v_reassigned_order_count = row_count;

  update public.baskets
  set
    user_id = v_current_user_id,
    updated_at = now()
  where user_id = p_guest_user_id
    and status <> 'open';

  get diagnostics v_reassigned_basket_count = row_count;

  select id
  into v_guest_open_basket_id
  from public.baskets
  where user_id = p_guest_user_id
    and status = 'open'
  order by created_at desc
  limit 1;

  select id
  into v_target_open_basket_id
  from public.baskets
  where user_id = v_current_user_id
    and status = 'open'
  order by created_at desc
  limit 1;

  if v_guest_open_basket_id is not null then
    if v_target_open_basket_id is null then
      update public.baskets
      set
        user_id = v_current_user_id,
        updated_at = now()
      where id = v_guest_open_basket_id;

      v_target_open_basket_id := v_guest_open_basket_id;
      v_reassigned_basket_count := v_reassigned_basket_count + 1;
    else
      insert into public.basket_items (basket_id, item_id, quantity)
      select
        v_target_open_basket_id,
        bi.item_id,
        bi.quantity
      from public.basket_items bi
      where bi.basket_id = v_guest_open_basket_id
      on conflict (basket_id, item_id)
      do update set
        quantity = public.basket_items.quantity + excluded.quantity,
        updated_at = now();

      get diagnostics v_merged_item_count = row_count;

      delete from public.basket_items
      where basket_id = v_guest_open_basket_id;

      update public.baskets
      set
        status = 'closed',
        is_active = false,
        is_deleted = true,
        updated_at = now()
      where id = v_guest_open_basket_id;
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'merged', true,
    'user_id', v_current_user_id,
    'guest_user_id', p_guest_user_id,
    'open_basket_id', v_target_open_basket_id,
    'reassigned_orders', v_reassigned_order_count,
    'reassigned_baskets', v_reassigned_basket_count,
    'merged_items', v_merged_item_count
  );
end;
$$;

revoke all on function public.merge_guest_account_data(uuid) from public;
revoke all on function public.merge_guest_account_data(uuid) from anon;
grant execute on function public.merge_guest_account_data(uuid) to authenticated;
grant execute on function public.merge_guest_account_data(uuid) to service_role;