-- DB-first order placement RPC.
-- Validates ownership/account state and performs basket status transition.
-- Triggers already handle order row creation + order item copying.

create or replace function public.place_order(p_basket_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_basket record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_active_account() then
    raise exception 'Account is deleted or inactive';
  end if;

  select b.id, b.user_id, b.status
  into v_basket
  from public.baskets b
  where b.id = p_basket_id
  limit 1;

  if v_basket is null then
    raise exception 'Basket not found';
  end if;

  if v_basket.user_id <> v_user_id then
    raise exception 'Forbidden basket access';
  end if;

  if v_basket.status <> 'open' then
    raise exception 'Basket is not open';
  end if;

  if not exists (
    select 1
    from public.basket_items bi
    where bi.basket_id = p_basket_id
  ) then
    raise exception 'Cannot place order for an empty basket';
  end if;

  update public.baskets
  set status = 'order_placed_pending_payment'
  where id = p_basket_id;

  return jsonb_build_object(
    'success', true,
    'basket_id', p_basket_id,
    'status', 'order_placed_pending_payment'
  );
end;
$$;

revoke all on function public.place_order(uuid) from public;
revoke all on function public.place_order(uuid) from anon;
grant execute on function public.place_order(uuid) to authenticated;
grant execute on function public.place_order(uuid) to service_role;
