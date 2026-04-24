-- Normalize kept canonical tags so their names/slugs are stable.
update public.tags
set name = 'Cute as a Button', slug = 'cute-as-a-button', updated_at = now()
where slug = 'cute-as-a-button-';

update public.tags
set name = 'Halfway to One', slug = 'halfway-to-one', updated_at = now()
where slug = 'halfway-to-one-';

update public.tags
set name = 'Hello Kitty', slug = 'hello-kitty', updated_at = now()
where slug = 'hello-kitty';

-- Create missing canonical theme tags.
insert into public.tags (name, slug, description)
values
  ('Angel', 'angel', 'Angel-themed products and decorations.'),
  ('Lilo & Stitch', 'lilo-and-stitch', 'Lilo & Stitch themed products and decorations.'),
  ('Rainbow', 'rainbow', 'Rainbow-themed products and decorations.')
on conflict (slug) do nothing;

-- Add canonical theme tags based on explicit product names/descriptions.
with tag_map as (
  select slug, id from public.tags
  where slug in (
    'angel',
    'cocomelon',
    'cute-as-a-button',
    'dinosaur',
    'fairy',
    'feeling-cute',
    'halfway-to-one',
    'hello-kitty',
    'lilo-and-stitch',
    'mermaid',
    'princess',
    'rainbow',
    'tinkerbell',
    'unicorn'
  )
),
product_matches as (
  select i.id as item_id, tm.id as tag_id
  from public.items i
  cross join tag_map tm
  where i.is_active = true
    and i.is_deleted = false
    and (
      (tm.slug = 'angel' and (i.name ilike '%angel%' or coalesce(i.description, '') ilike '%angel%')) or
      (tm.slug = 'cocomelon' and (i.name ilike '%cocomelon%' or coalesce(i.description, '') ilike '%cocomelon%')) or
      (tm.slug = 'cute-as-a-button' and (i.name ilike '%cute as a button%' or coalesce(i.description, '') ilike '%cute as a button%')) or
      (tm.slug = 'dinosaur' and ((i.name ilike '%dino%' or i.name ilike '%dinosaur%') or (coalesce(i.description, '') ilike '%dino%' or coalesce(i.description, '') ilike '%dinosaur%'))) or
      (tm.slug = 'fairy' and ((i.name ilike '%fairy%' or i.name ilike '%fairyland%') or (coalesce(i.description, '') ilike '%fairy%' or coalesce(i.description, '') ilike '%fairyland%'))) or
      (tm.slug = 'feeling-cute' and (i.name ilike '%feeling cute%' or coalesce(i.description, '') ilike '%feeling cute%')) or
      (tm.slug = 'halfway-to-one' and ((i.name ilike '%halfway to one%' or i.name ilike '%1/2 way to one%') or (coalesce(i.description, '') ilike '%halfway to one%' or coalesce(i.description, '') ilike '%1/2 way to one%'))) or
      (tm.slug = 'hello-kitty' and ((i.name ilike '%hello kitty%' or coalesce(i.description, '') ilike '%hello kitty%'))) or
      (tm.slug = 'lilo-and-stitch' and ((i.name ilike '%lilo%' or i.name ilike '%stitch%') or (coalesce(i.description, '') ilike '%lilo%' or coalesce(i.description, '') ilike '%stitch%'))) or
      (tm.slug = 'mermaid' and ((i.name ilike '%mermaid%' or coalesce(i.description, '') ilike '%mermaid%'))) or
      (tm.slug = 'princess' and ((i.name ilike '%princess%' or coalesce(i.description, '') ilike '%princess%'))) or
      (tm.slug = 'rainbow' and ((i.name ilike '%rainbow%' or coalesce(i.description, '') ilike '%rainbow%'))) or
      (tm.slug = 'tinkerbell' and ((i.name ilike '%tinker bell%' or i.name ilike '%tinkerbell%') or (coalesce(i.description, '') ilike '%tinker bell%' or coalesce(i.description, '') ilike '%tinkerbell%'))) or
      (tm.slug = 'unicorn' and ((i.name ilike '%unicorn%' or i.name ilike '%unocorn%' or coalesce(i.description, '') ilike '%unicorn%' or coalesce(i.description, '') ilike '%unocorn%')))
    )
)
insert into public.items_tags (item_id, tag_id)
select distinct item_id, tag_id
from product_matches
on conflict do nothing;

-- Merge synonymous tags into their canonical replacements.
with merge_pairs as (
  select legacy.id as legacy_tag_id, canonical.id as canonical_tag_id
  from public.tags legacy
  join public.tags canonical on (
    (legacy.slug = 'fairyland' and canonical.slug = 'fairy') or
    (legacy.slug = 'little-princess' and canonical.slug = 'princess') or
    (legacy.slug = 'unocorn' and canonical.slug = 'unicorn')
  )
)
insert into public.items_tags (item_id, tag_id)
select distinct it.item_id, mp.canonical_tag_id
from public.items_tags it
join merge_pairs mp on mp.legacy_tag_id = it.tag_id
on conflict do nothing;

-- Remove legacy, malformed, and low-signal tags after reassignment.
with obsolete_tags as (
  select id
  from public.tags
  where slug in (
    'boxes-',
    'cupcake-',
    'fairyland',
    'little-princess',
    'magical',
    'test',
    'unocorn'
  )
)
delete from public.items_tags
where tag_id in (select id from obsolete_tags);

delete from public.tags
where slug in (
  'boxes-',
  'cupcake-',
  'fairyland',
  'little-princess',
  'magical',
  'test',
  'unocorn'
);