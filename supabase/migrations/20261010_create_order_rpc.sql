-- Atomic checkout RPC. Execute only after verifying actual foreign keys/schema.
create or replace function public.create_order_secure(
 p_customer_id uuid, p_items jsonb, p_recipient_name text, p_recipient_phone text,
 p_shipping_address text, p_shipping_postal_code text, p_shipping_cost numeric default 0,
 p_payment_method text default 'manual_transfer', p_notes text default null
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare it jsonb; pid uuid; qty integer; prod public.products%rowtype; role_name text; reseller text;
 price numeric; sub numeric:=0; total_amt numeric; oid uuid;
begin
 if p_customer_id is null then raise exception 'CUSTOMER_REQUIRED'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>50 then raise exception 'INVALID_ITEMS'; end if;
 if length(trim(coalesce(p_recipient_name,'')))<2 or length(trim(coalesce(p_recipient_phone,'')))<6 or length(trim(coalesce(p_shipping_address,'')))<8 then raise exception 'INVALID_SHIPPING_DETAILS'; end if;
 if p_shipping_cost is null or p_shipping_cost<0 or p_shipping_cost>10000000 then raise exception 'INVALID_SHIPPING_COST'; end if;
 if p_payment_method not in ('manual_transfer','payment_gateway') then raise exception 'INVALID_PAYMENT_METHOD'; end if;
 select user_role,reseller_status into role_name,reseller from public.profiles where id=p_customer_id;
 if not found then raise exception 'PROFILE_REQUIRED'; end if;
 insert into public.orders(customer_id,status,payment_method,subtotal,shipping_cost,total,recipient_name,recipient_phone,shipping_address,shipping_postal_code,payment_status,notes)
 values(p_customer_id,'pending',p_payment_method,0,p_shipping_cost,0,trim(p_recipient_name),trim(p_recipient_phone),trim(p_shipping_address),nullif(trim(coalesce(p_shipping_postal_code,'')),''),'unpaid',nullif(trim(coalesce(p_notes,'')),'')) returning id into oid;
 for it in select value from jsonb_array_elements(p_items) loop
   pid:=nullif(it->>'product_id','')::uuid; qty:=(it->>'quantity')::integer;
   if pid is null or qty is null or qty<1 or qty>100 then raise exception 'INVALID_ITEM'; end if;
   select * into prod from public.products where id=pid and is_active=true for update;
   if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
   if prod.stock<qty then raise exception 'INSUFFICIENT_STOCK'; end if;
   price:=coalesce(prod.retail_price,0);
   if reseller='approved' and role_name<>'admin' then
     select reseller_price into price from public.product_prices where product_id=pid;
     price:=coalesce(price,prod.retail_price);
   end if;
   if price<0 then raise exception 'INVALID_PRODUCT_PRICE'; end if;
   insert into public.order_items(order_id,product_id,product_name,quantity,unit_price) values(oid,pid,prod.name,qty,price);
   update public.products set stock=stock-qty where id=pid;
   sub:=sub+(price*qty);
 end loop;
 total_amt:=sub+p_shipping_cost;
 update public.orders set subtotal=sub,total=total_amt where id=oid;
 return jsonb_build_object('order_id',oid,'status','pending','payment_status','unpaid','subtotal',sub,'shipping_cost',p_shipping_cost,'total',total_amt);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception 'INVALID_ITEM_FORMAT';
end; $$;
revoke all on function public.create_order_secure(uuid,jsonb,text,text,text,text,numeric,text,text) from public,anon,authenticated;
grant execute on function public.create_order_secure(uuid,jsonb,text,text,text,text,numeric,text,text) to service_role;
