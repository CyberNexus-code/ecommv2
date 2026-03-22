-- Dev-only helper: run this in your DEV Supabase SQL editor.
-- Do not apply this to production.
--
-- NOTE:
-- PostgREST typically exposes the "public" schema only.
-- For reliable RPC access without changing API exposed schemas, keep this function in "public"
-- and restrict execute privilege to service_role only.

create or replace function public.introspection_snapshot(target_schemas text[] default array['public'])
returns jsonb
language sql
security definer
set search_path = pg_catalog, public, information_schema
as $$
  with table_rows as (
    select
      t.table_schema,
      t.table_name
    from information_schema.tables t
    where t.table_type = 'BASE TABLE'
      and t.table_schema = any(target_schemas)
    order by t.table_schema, t.table_name
  ),
  column_rows as (
    select
      c.table_schema,
      c.table_name,
      c.column_name,
      c.ordinal_position,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default
    from information_schema.columns c
    where c.table_schema = any(target_schemas)
    order by c.table_schema, c.table_name, c.ordinal_position
  ),
  constraint_rows as (
    select
      n.nspname as table_schema,
      cls.relname as table_name,
      con.conname as constraint_name,
      case con.contype
        when 'p' then 'PRIMARY KEY'
        when 'f' then 'FOREIGN KEY'
        when 'u' then 'UNIQUE'
        when 'c' then 'CHECK'
        else con.contype::text
      end as constraint_type,
      pg_get_constraintdef(con.oid) as definition
    from pg_constraint con
    join pg_class cls on cls.oid = con.conrelid
    join pg_namespace n on n.oid = cls.relnamespace
    where n.nspname = any(target_schemas)
    order by n.nspname, cls.relname, con.conname
  ),
  relation_rows as (
    select
      tc.constraint_schema as source_schema,
      tc.table_name as source_table,
      kcu.column_name as source_column,
      ccu.table_schema as target_schema,
      ccu.table_name as target_table,
      ccu.column_name as target_column,
      tc.constraint_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
      and tc.constraint_schema = kcu.constraint_schema
      and tc.table_name = kcu.table_name
    join information_schema.constraint_column_usage ccu
      on tc.constraint_name = ccu.constraint_name
      and tc.constraint_schema = ccu.constraint_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.constraint_schema = any(target_schemas)
    order by tc.constraint_schema, tc.table_name, tc.constraint_name, kcu.ordinal_position
  ),
  policy_rows as (
    select
      p.schemaname as table_schema,
      p.tablename as table_name,
      p.policyname as policy_name,
      p.cmd as command,
      p.roles,
      p.qual as using_expression,
      p.with_check as with_check_expression
    from pg_policies p
    where p.schemaname = any(target_schemas)
    order by p.schemaname, p.tablename, p.policyname
  ),
  function_rows as (
    select
      n.nspname as function_schema,
      p.proname as function_name,
      p.oid::regprocedure::text as signature,
      pg_get_functiondef(p.oid) as definition,
      l.lanname as language_name,
      p.prosecdef as security_definer
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_language l on l.oid = p.prolang
    where n.nspname = any(target_schemas)
    order by n.nspname, p.proname, p.oid::regprocedure::text
  ),
  trigger_rows as (
    select
      n.nspname as table_schema,
      c.relname as table_name,
      t.tgname as trigger_name,
      pg_get_triggerdef(t.oid) as definition,
      t.tgenabled as enabled_state
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where not t.tgisinternal
      and n.nspname = any(target_schemas)
    order by n.nspname, c.relname, t.tgname
  ),
  view_rows as (
    select
      v.table_schema,
      v.table_name as view_name,
      v.view_definition
    from information_schema.views v
    where v.table_schema = any(target_schemas)
    order by v.table_schema, v.table_name
  ),
  index_rows as (
    select
      schemaname as table_schema,
      tablename as table_name,
      indexname as index_name,
      indexdef as definition
    from pg_indexes
    where schemaname = any(target_schemas)
    order by schemaname, tablename, indexname
  ),
  enum_rows as (
    select
      n.nspname as type_schema,
      t.typname as type_name,
      e.enumsortorder as sort_order,
      e.enumlabel as label
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = any(target_schemas)
    order by n.nspname, t.typname, e.enumsortorder
  )
  select jsonb_build_object(
    'generated_at', now(),
    'target_schemas', target_schemas,
    'tables', coalesce((select jsonb_agg(to_jsonb(table_rows)) from table_rows), '[]'::jsonb),
    'columns', coalesce((select jsonb_agg(to_jsonb(column_rows)) from column_rows), '[]'::jsonb),
    'constraints', coalesce((select jsonb_agg(to_jsonb(constraint_rows)) from constraint_rows), '[]'::jsonb),
    'relations', coalesce((select jsonb_agg(to_jsonb(relation_rows)) from relation_rows), '[]'::jsonb),
    'rls_policies', coalesce((select jsonb_agg(to_jsonb(policy_rows)) from policy_rows), '[]'::jsonb),
    'functions', coalesce((select jsonb_agg(to_jsonb(function_rows)) from function_rows), '[]'::jsonb),
    'triggers', coalesce((select jsonb_agg(to_jsonb(trigger_rows)) from trigger_rows), '[]'::jsonb),
    'views', coalesce((select jsonb_agg(to_jsonb(view_rows)) from view_rows), '[]'::jsonb),
    'indexes', coalesce((select jsonb_agg(to_jsonb(index_rows)) from index_rows), '[]'::jsonb),
    'enums', coalesce((select jsonb_agg(to_jsonb(enum_rows)) from enum_rows), '[]'::jsonb)
  );
$$;

revoke all on function public.introspection_snapshot(text[]) from public;
revoke all on function public.introspection_snapshot(text[]) from anon;
revoke all on function public.introspection_snapshot(text[]) from authenticated;
grant execute on function public.introspection_snapshot(text[]) to service_role;

-- Cleanup old version if it exists
drop function if exists devtools.introspection_snapshot(text[]);
