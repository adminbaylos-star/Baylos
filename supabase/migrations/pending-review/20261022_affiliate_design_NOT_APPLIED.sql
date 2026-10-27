-- DRAF SAJA: JANGAN JALANKAN SEBELUM AUDIT RLS, SKEMA ORDERS DAN WEBHOOK.
-- Pilihan C: komisi persentase atau nominal per produk.
create table if not exists public.affiliate_product_rules (
 product_id uuid primary key references public.products(id) on delete cascade,
 enabled boolean not null default false,
 commission_type text not null check (commission_type in ('percent','fixed')),
 commission_value numeric(14,2) not null check (commission_value >= 0),
 updated_at timestamptz not null default now()
);
create table if not exists public.affiliate_referrals (
 id uuid primary key default gen_random_uuid(),
 affiliate_user_id uuid not null references auth.users(id),
 referral_code text not null unique,
 created_at timestamptz not null default now()
);
create table if not exists public.affiliate_attributions (
 order_id uuid primary key references public.orders(id),
 affiliate_user_id uuid not null references auth.users(id),
 referral_code text not null,
 attributed_at timestamptz not null default now()
);
create table if not exists public.affiliate_commissions (
 id uuid primary key default gen_random_uuid(),
 order_item_id uuid not null unique references public.order_items(id),
 affiliate_user_id uuid not null references auth.users(id),
 commission_amount numeric(14,2) not null check (commission_amount >= 0),
 status text not null default 'pending' check (status in ('pending','available','paid','cancelled')),
 created_at timestamptz not null default now()
);
-- Tabel di atas sengaja belum memberi GRANT / policy untuk browser.
-- Semua mutasi komisi harus lewat backend tepercaya, transaksi idempotent,
-- validasi pembayaran, konfirmasi pengiriman, refund, dan anti-self-referral.
