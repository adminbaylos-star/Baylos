-- Read-only audit: does not modify Baylos data.
select table_name, column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles','products','product_prices','reseller_applications','orders','order_items')
order by table_name, ordinal_position;

-- Run separately to inspect primary/foreign keys and other constraints.
select tc.table_name, tc.constraint_type, tc.constraint_name, kcu.column_name,
       ccu.table_name as foreign_table_name, ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
where tc.table_schema = 'public'
  and tc.table_name in ('profiles','products','product_prices','reseller_applications','orders','order_items')
order by tc.table_name, tc.constraint_type, tc.constraint_name;

-- Run separately to inspect RLS policies.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','products','product_prices','reseller_applications','orders','order_items')
order by tablename, policyname;
