-- BAYLOS | Read-only preflight. Run BEFORE any migration when ready.
SELECT table_name FROM information_schema.tables
 WHERE table_schema='public' AND table_name IN
 ('products','product_variants','product_images','product_prices','profiles','orders','order_items')
 ORDER BY table_name;
SELECT table_name,column_name,data_type,is_nullable
 FROM information_schema.columns
 WHERE table_schema='public' AND table_name IN ('products','orders','product_variants','order_items')
 ORDER BY table_name,ordinal_position;
SELECT tablename,rowsecurity FROM pg_tables
 WHERE schemaname='public' AND tablename IN ('products','orders','product_variants','order_items');
SELECT indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='orders';
-- These checks do not reveal customer addresses or private order data.
SELECT count(*) AS products_total,
 count(*) FILTER (WHERE stock > 10000) AS products_with_stock_above_10000
 FROM public.products;
