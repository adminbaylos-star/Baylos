-- Review schema first. Additive migration; does not delete existing data.
begin;
alter table public.orders
  add column if not exists recipient_name text,
  add column if not exists recipient_phone text,
  add column if not exists shipping_address text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_courier text,
  add column if not exists shipping_service text,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_reference text,
  add column if not exists notes text;
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid','pending_verification','paid','failed','refunded'));
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('manual_transfer','payment_gateway'));
commit;
