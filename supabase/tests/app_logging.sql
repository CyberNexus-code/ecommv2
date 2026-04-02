begin;

select plan(4);

select has_table('public', 'app_logs', 'app_logs table exists');
select col_is_pk('public', 'app_logs', 'id', 'app_logs.id is the primary key');
select has_function('public', 'cleanup_app_logs', array['interval'], 'cleanup_app_logs(interval) exists');
select col_type_is('public', 'app_logs', 'metadata', 'jsonb', 'app_logs.metadata uses jsonb');

select * from finish();

rollback;