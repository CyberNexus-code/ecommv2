drop policy if exists items_admin_select on public.items;
create policy items_admin_select
on public.items
for select
to authenticated
using (public.is_admin());

drop policy if exists item_images_admin_select on public.item_images;
create policy item_images_admin_select
on public.item_images
for select
to authenticated
using (public.is_admin());