-- BAYLOS | Read-only verification after migration 01.
SELECT column_name,data_type,column_default FROM information_schema.columns
 WHERE table_schema='public' AND table_name='products'
 AND column_name IN ('weight_grams','stock_verified') ORDER BY column_name;
SELECT column_name,data_type FROM information_schema.columns
 WHERE table_schema='public' AND table_name='orders'
 AND column_name IN ('checkout_request_id','checkout_payload_hash') ORDER BY column_name;
SELECT indexname FROM pg_indexes WHERE schemaname='public'
 AND tablename='orders' AND indexname='baylos_orders_customer_checkout_request_uidx';
SELECT count(*) FILTER (WHERE stock_verified) AS verified,
 count(*) FILTER (WHERE NOT stock_verified) AS unverified
 FROM public.products;
