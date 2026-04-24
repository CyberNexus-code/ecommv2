with category_slugs as (
  select lower(regexp_replace(regexp_replace(trim(name), '\s+', '-', 'g'), '[^a-z0-9-]', '', 'g')) as slug
  from public.categories
  where is_deleted = false
),
legacy_tag_ids as (
  select id
  from public.tags
  where slug in (
    '3d',
    'box',
    'boxes',
    'cake-topper',
    'cake-toppers',
    'cupcake',
    'cupcakes',
    'cupcake-wrapper',
    'cupcake-wrappers',
    'full-part-set',
    'party-box',
    'party-boxes',
    'set-of-4',
    'set-of-6',
    'set-of-20',
    'topper',
    'toppers',
    'water-bottle-wrapper',
    'water-bottle-wrappers',
    'wrapper',
    'wrappers'
  )
  or slug in (select slug from category_slugs)
)
delete from public.items_tags
where tag_id in (select id from legacy_tag_ids);

with category_slugs as (
  select lower(regexp_replace(regexp_replace(trim(name), '\s+', '-', 'g'), '[^a-z0-9-]', '', 'g')) as slug
  from public.categories
  where is_deleted = false
)
delete from public.tags
where slug in (
  '3d',
  'box',
  'boxes',
  'cake-topper',
  'cake-toppers',
  'cupcake',
  'cupcakes',
  'cupcake-wrapper',
  'cupcake-wrappers',
  'full-part-set',
  'party-box',
  'party-boxes',
  'set-of-4',
  'set-of-6',
  'set-of-20',
  'topper',
  'toppers',
  'water-bottle-wrapper',
  'water-bottle-wrappers',
  'wrapper',
  'wrappers'
)
or slug in (select slug from category_slugs);