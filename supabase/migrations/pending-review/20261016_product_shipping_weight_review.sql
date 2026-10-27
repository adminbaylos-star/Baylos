-- REVIEW ONLY; do not run until schema audit and deployment plan are approved.
-- Null by default: shipping rates cannot be quoted until admin records actual weights.
alter table public.products add column if not exists weight_grams integer;
-- Avoid validating existing unknown weights automatically.
alter table public.products add constraint products_weight_grams_valid
  check (weight_grams is null or weight_grams between 1 and 100000);
