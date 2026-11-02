-- Baylos affiliate program foundation (additive; review against the live schema before applying).
-- This migration enables affiliate membership, shareable codes, click logs, and admin-managed rules.
-- It intentionally DOES NOT create payable commissions or enable production checkout/payouts.

create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null unique,
  created_at timestamptz not null default now()
);
create unique index if not exists affiliate_referrals_one_per_user on public.affiliate_referrals(affiliate_user_id);

create table if not exists public.affiliate_clicks (
  id bigint generated always as identity primary key,
  referral_code text not null references public.affiliate_referrals(referral_code) on delete cascade,
  landing_path text not null default '/',
  clicked_at timestamptz not null default now()
);
create index if not exists affiliate_clicks_code_time_idx on public.affiliate_clicks(referral_code, clicked_at desc);

create table if not exists public.affiliate_commission_rules (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null check (scope_type in ('all','product')),
  product_id uuid references public.products(id) on delete cascade,
  commission_type text not null check (commission_type in ('percent','fixed')),
  commission_value numeric(14,2) not null check (commission_value > 0 and (commission_type <> 'percent' or commission_value <= 100)),
  enabled boolean not null default false,
  note text not null default '',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint affiliate_rule_scope_product_check check ((scope_type='all' and product_id is null) or (scope_type='product' and product_id is not null))
);
create unique index if not exists affiliate_commission_rules_all_unique on public.affiliate_commission_rules(scope_type) where scope_type='all';
create unique index if not exists affiliate_commission_rules_product_unique on public.affiliate_commission_rules(product_id) where scope_type='product';

alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_commission_rules enable row level security;
revoke all on public.affiliate_referrals from anon;
revoke all on public.affiliate_clicks from anon, authenticated;
revoke all on public.affiliate_commission_rules from anon;
grant select on public.affiliate_referrals to authenticated;
grant select on public.affiliate_clicks to authenticated;
grant select on public.affiliate_commission_rules to authenticated;

drop policy if exists "affiliate referral own select" on public.affiliate_referrals;
create policy "affiliate referral own select" on public.affiliate_referrals for select to authenticated
  using (affiliate_user_id = (select auth.uid()) or public.is_baylos_admin());
drop policy if exists "affiliate clicks admin select" on public.affiliate_clicks;
create policy "affiliate clicks admin select" on public.affiliate_clicks for select to authenticated
  using (public.is_baylos_admin());
drop policy if exists "affiliate rules read active" on public.affiliate_commission_rules;
create policy "affiliate rules read active" on public.affiliate_commission_rules for select to authenticated
  using (enabled = true or public.is_baylos_admin());
drop policy if exists "affiliate rules admin insert" on public.affiliate_commission_rules;
create policy "affiliate rules admin insert" on public.affiliate_commission_rules for insert to authenticated
  with check (public.is_baylos_admin() and updated_by = (select auth.uid()));
drop policy if exists "affiliate rules admin update" on public.affiliate_commission_rules;
create policy "affiliate rules admin update" on public.affiliate_commission_rules for update to authenticated
  using (public.is_baylos_admin()) with check (public.is_baylos_admin() and updated_by = (select auth.uid()));
drop policy if exists "affiliate rules admin delete" on public.affiliate_commission_rules;
create policy "affiliate rules admin delete" on public.affiliate_commission_rules for delete to authenticated
  using (public.is_baylos_admin());

grant execute on function public.is_baylos_admin() to authenticated;

create or replace function public.baylos_join_affiliate()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_code text;
begin
  if v_user is null then raise exception 'Silakan login terlebih dahulu.'; end if;
  select referral_code into v_code from public.affiliate_referrals where affiliate_user_id=v_user;
  if v_code is not null then return v_code; end if;
  v_code := 'BAY' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
  insert into public.affiliate_referrals(affiliate_user_id,referral_code) values(v_user,v_code)
  on conflict (affiliate_user_id) do nothing;
  select referral_code into v_code from public.affiliate_referrals where affiliate_user_id=v_user;
  return v_code;
end;
$$;
revoke all on function public.baylos_join_affiliate() from public, anon;
grant execute on function public.baylos_join_affiliate() to authenticated;

create or replace function public.baylos_track_affiliate_click(p_referral_code text, p_landing_path text default '/')
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_code text := upper(trim(coalesce(p_referral_code,''))); v_path text := coalesce(p_landing_path,'/');
begin
  if length(v_code) < 6 or length(v_code) > 40 or v_code !~ '^[A-Z0-9_-]+$' then return false; end if;
  if length(v_path) > 300 or left(v_path,1) <> '/' or position('://' in v_path) > 0 then v_path := '/'; end if;
  if not exists(select 1 from public.affiliate_referrals r where r.referral_code=v_code) then return false; end if;
  insert into public.affiliate_clicks(referral_code,landing_path) values(v_code,v_path);
  return true;
end;
$$;
revoke all on function public.baylos_track_affiliate_click(text,text) from public;
grant execute on function public.baylos_track_affiliate_click(text,text) to anon, authenticated;

-- No direct client write access to referral codes, click logs, or commission rules.
