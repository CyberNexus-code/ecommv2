-- DB-first basket read RPC.
-- Returns current user's open basket items in the app UI shape.

create or replace function public.get_open_basket_items()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_basket_id uuid;
  v_result jsonb;
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
    return '[]'::jsonb;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', bi.id,
        'basket_id', bi.basket_id,
        'quantity', bi.quantity,
        'items', jsonb_build_object(
          'id', i.id,
          'name', i.name,
          'price', i.price,
          'item_images',
            coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'id', ii.id,
                    'image_url', ii.image_url,
                    'is_thumbnail', ii.is_thumbnail,
                    'alt_text', ii.alt_text
                  )
                  order by ii.sort_order asc, ii.created_at asc
                )
                from public.item_images ii
                where ii.item_id = i.id
              ),
              '[]'::jsonb
            )
        )
      )
      order by bi.created_at desc
    ),
    '[]'::jsonb
  )
  into v_result
  from public.basket_items bi
  join public.items i on i.id = bi.item_id
  where bi.basket_id = v_basket_id;

  return v_result;
end;
$$;

revoke all on function public.get_open_basket_items() from public;
revoke all on function public.get_open_basket_items() from anon;
grant execute on function public.get_open_basket_items() to authenticated;
grant execute on function public.get_open_basket_items() to service_role;
