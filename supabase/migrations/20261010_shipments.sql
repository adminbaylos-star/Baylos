-- Additive migration. Assumes public.orders.id is UUID; inspect existing schema first.
-- Does not modify existing customer/order/product records.
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  provider text not null default 'biteship' check (provider = 'biteship'),
  provider_order_id text unique,
  courier_company text,
  courier_type text,
  waybill_id text,
  shipping_cost bigint not null default 0 check (shipping_cost >= 0),
  status text not null default 'pending',
  tracking_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shipments enable row level security;
-- Intentionally no client INSERT/UPDATE/DELETE policies. Use trusted Edge Functions.
-- Owner-read policy assumes orders.customer_id equals auth.uid(). Validate actual schema first.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipments' AND policyname='shipment_owner_read') THEN
    CREATE POLICY shipment_owner_read ON public.shipments FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = shipments.order_id AND o.customer_id = auth.uid()));
  END IF;
END $$;
