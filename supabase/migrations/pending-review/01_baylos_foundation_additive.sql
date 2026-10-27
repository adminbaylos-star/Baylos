-- BAYLOS | Migration 01 | REVIEW BEFORE APPLYING
-- Additive only. Does not enable checkout, update stock, or modify user roles.
BEGIN;
DO $$ BEGIN
 IF to_regclass('public.products') IS NULL OR to_regclass('public.orders') IS NULL THEN
  RAISE EXCEPTION 'Baylos prerequisite tables products/orders missing';
 END IF;
END $$;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_grams integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS checkout_request_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS checkout_payload_hash text;
-- A named constraint is added only if absent, to support safe re-runs.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='baylos_products_weight_grams_check' AND conrelid='public.products'::regclass) THEN
  ALTER TABLE public.products ADD CONSTRAINT baylos_products_weight_grams_check
    CHECK (weight_grams IS NULL OR weight_grams BETWEEN 1 AND 100000);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='baylos_orders_checkout_hash_check' AND conrelid='public.orders'::regclass) THEN
  ALTER TABLE public.orders ADD CONSTRAINT baylos_orders_checkout_hash_check
    CHECK (checkout_payload_hash IS NULL OR length(checkout_payload_hash) = 32);
 END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS baylos_orders_customer_checkout_request_uidx
 ON public.orders(customer_id, checkout_request_id)
 WHERE checkout_request_id IS NOT NULL;
COMMENT ON COLUMN public.products.stock_verified IS 'FALSE until an admin verifies physical inventory; legacy rows remain unverified.';
COMMENT ON COLUMN public.products.weight_grams IS 'Verified packaged weight for server-side shipping quotes; NULL means unavailable.';
COMMENT ON COLUMN public.orders.checkout_request_id IS 'Server-validated idempotency UUID; NULL allowed for legacy orders.';
COMMENT ON COLUMN public.orders.checkout_payload_hash IS 'Server-generated canonical checkout payload md5 for replay detection.';
COMMIT;
