-- BAYLOS STAGE 70: REVIEW ONLY. DO NOT DEPLOY.
-- Requires stock_verified migration; intentionally blocked until trusted shipping quote is implemented.
-- DRAFT FOR REVIEW: do not execute until schema and operational rules verified.
-- This function is callable only by service_role. The Edge Function authenticates the customer.
create or replace function public.create_order_secure(
 p_customer_id uuid, p_items jsonb, p_recipient_name text, p_recipient_phone text,
 p_shipping_address text, p_shipping_postal_code text, p_shipping_cost numeric default 0,
 p_payment_method text default 'manual_transfer', p_notes text default null,
 p_checkout_request_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 it jsonb; pid uuid; vid uuid; qty integer; prod public.products%rowtype;
 v public.product_variants%rowtype; role_name text; reseller text;
 price numeric; sub numeric := 0; oid uuid; n integer;
 existing_order public.orders%rowtype; payload_fingerprint text;
begin
 if to_regclass('public.orders') is null then raise exception 'SCHEMA_NOT_READY'; end if;
 if p_customer_id is null then raise exception 'CUSTOMER_REQUIRED'; end if;
 if p_customer_id is distinct from auth.uid() and auth.role() <> 'service_role' then
   raise exception 'CUSTOMER_IDENTITY_MISMATCH';
 end if;
 if p_checkout_request_id is null then raise exception 'CHECKOUT_REQUEST_ID_REQUIRED'; end if;
 -- Requires stage55 additive unique index; reject schema mismatch before processing.
 if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='checkout_request_id') then raise exception 'IDEMPOTENCY_SCHEMA_NOT_READY'; end if;
 if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'INVALID_ITEMS'; end if;
 if length(btrim(coalesce(p_recipient_name,''))) < 2 or length(btrim(coalesce(p_recipient_phone,''))) < 6 or length(btrim(coalesce(p_shipping_address,''))) < 8 then raise exception 'INVALID_SHIPPING_DETAILS'; end if;
 -- Shipping quote integration not yet trusted: zero only, manual confirmation needed.
 if p_shipping_cost is distinct from 0 then raise exception 'SHIPPING_NOT_CONFIGURED'; end if;
 if p_payment_method <> 'manual_transfer' then raise exception 'PAYMENT_GATEWAY_NOT_CONFIGURED'; end if;
 -- A retry with the same key must never create a second order.
 -- Transaction-scoped advisory lock serializes identical customer/key attempts.
 perform pg_advisory_xact_lock(hashtextextended(p_customer_id::text || ':' || p_checkout_request_id::text, 0));
 -- Fingerprint includes order content; do not include client-supplied prices.
 payload_fingerprint := md5(jsonb_build_object('items',p_items,'recipient_name',btrim(p_recipient_name),
   'recipient_phone',btrim(p_recipient_phone),'shipping_address',btrim(p_shipping_address),
   'shipping_postal_code',coalesce(p_shipping_postal_code,''),'payment_method',p_payment_method,
   'notes',coalesce(p_notes,''))::text);
 -- IMPORTANT: fingerprint persistence/verification still requires a dedicated column.
 -- Fail closed until a matching payload fingerprint can be stored and checked.
 if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='checkout_payload_hash') then
   raise exception 'IDEMPOTENCY_HASH_SCHEMA_NOT_READY';
 end if;
 select * into existing_order from public.orders
 where customer_id=p_customer_id and checkout_request_id=p_checkout_request_id;
 if found then
   if existing_order.checkout_payload_hash is distinct from payload_fingerprint then
     raise exception 'CHECKOUT_REQUEST_REUSED_WITH_DIFFERENT_PAYLOAD';
   end if;
   return jsonb_build_object('order_id',existing_order.id,'status',existing_order.status,
     'payment_status',existing_order.payment_status,'subtotal',existing_order.subtotal,
     'shipping_cost',existing_order.shipping_cost,'total',existing_order.total,'replayed',true);
 end if;
 -- RELEASE BLOCKER: quote must be independently verified and consumed atomically.
 -- Never trust p_shipping_cost from the client or remove this guard before implementing that verification.
 raise exception 'CHECKOUT_NOT_READY_SHIPPING_QUOTE';
 select user_role, reseller_status into role_name, reseller from public.profiles where id = p_customer_id;
 if not found then raise exception 'PROFILE_REQUIRED'; end if;
 -- Reject repeated product/variant lines to avoid ambiguous inventory accounting.
 if exists (select 1 from (select x->>'product_id' pid, nullif(x->>'variant_id','') vid, count(*) c from jsonb_array_elements(p_items) x group by 1,2 having count(*)>1) d) then raise exception 'DUPLICATE_ITEM'; end if;
 -- Lock product rows in deterministic order to avoid deadlocks for overlapping carts.
 perform 1 from public.products p where p.id in (
   select distinct (x->>'product_id')::uuid from jsonb_array_elements(p_items) x
 ) order by p.id for update;
 insert into public.orders(customer_id,status,payment_method,subtotal,shipping_cost,total,recipient_name,recipient_phone,shipping_address,shipping_postal_code,payment_status,notes,checkout_request_id,checkout_payload_hash)
 values(p_customer_id,'pending',p_payment_method,0,0,0,btrim(p_recipient_name),btrim(p_recipient_phone),btrim(p_shipping_address),nullif(btrim(coalesce(p_shipping_postal_code,'')),''),'unpaid',nullif(btrim(coalesce(p_notes,'')),''),p_checkout_request_id,payload_fingerprint) returning id into oid;
 for it in select value from jsonb_array_elements(p_items) loop
   pid := (it->>'product_id')::uuid;
   vid := nullif(it->>'variant_id','')::uuid;
   qty := (it->>'quantity')::integer;
   if pid is null or qty is null or qty not between 1 and 100 then raise exception 'INVALID_ITEM'; end if;
   select * into prod from public.products where id=pid and is_active=true;
   if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
   if not prod.stock_verified then raise exception 'STOCK_NOT_VERIFIED'; end if;
   select count(*) into n from public.product_variants where product_id=pid;
   if n > 0 then
     if vid is null then raise exception 'VARIANT_REQUIRED'; end if;
     select * into v from public.product_variants where id=vid and product_id=pid and is_active=true for update;
     if not found then raise exception 'INVALID_VARIANT'; end if;
     if v.stock < qty then raise exception 'INSUFFICIENT_VARIANT_STOCK'; end if;
     update public.product_variants set stock=stock-qty where id=vid;
   else
     if vid is not null then raise exception 'VARIANT_NOT_ALLOWED'; end if;
     if prod.stock < qty then raise exception 'INSUFFICIENT_STOCK'; end if;
     update public.products set stock=stock-qty where id=pid;
   end if;
   price := prod.retail_price;
   if reseller='approved' then
     select pp.reseller_price into price from public.product_prices pp where pp.product_id=pid;
     price := coalesce(price,prod.retail_price);
   end if;
   if price is null or price < 0 then raise exception 'INVALID_PRICE'; end if;
   if vid is not null then price := price + v.price_adjustment; end if;
   if price < 0 then raise exception 'INVALID_VARIANT_PRICE'; end if;
   insert into public.order_items(order_id,product_id,variant_id,product_name,quantity,unit_price)
   values(oid,pid,vid,prod.name,qty,price);
   sub := sub + price * qty;
 end loop;
 update public.orders set subtotal=sub,total=sub where id=oid;
 return jsonb_build_object('order_id',oid,'status','pending','payment_status','unpaid','subtotal',sub,'shipping_cost',0,'total',sub);
exception when invalid_text_representation or numeric_value_out_of_range then
 raise exception 'INVALID_ITEM_FORMAT';
end; $$;
revoke all on function public.create_order_secure(uuid,jsonb,text,text,text,text,numeric,text,text,uuid) from public,anon,authenticated;
grant execute on function public.create_order_secure(uuid,jsonb,text,text,text,text,numeric,text,text,uuid) to service_role;
