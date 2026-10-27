-- DRAF: tinjau skema, RLS dan kebijakan privasi sebelum dijalankan.
create table if not exists public.affiliate_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique references auth.users(id) on delete cascade,
 legal_name text not null check(length(trim(legal_name)) between 3 and 120),
 nik text not null check(nik ~ '^[0-9]{16}$'),
 phone text not null,
 address text not null,
 ktp_path text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected','needs_revision','suspended')),
 consented_at timestamptz not null,
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id),
 review_note text
);
-- CATATAN: NIK mentah di database adalah data sensitif; sebelum produksi,
-- gunakan enkripsi tingkat aplikasi/server atau layanan vault dan kebijakan retensi.
alter table public.affiliate_applications enable row level security;
revoke all on public.affiliate_applications from anon;
grant select,insert on public.affiliate_applications to authenticated;
create policy "affiliate own select" on public.affiliate_applications for select to authenticated using (user_id=auth.uid());
create policy "affiliate own insert" on public.affiliate_applications for insert to authenticated with check(user_id=auth.uid() and status='pending' and reviewed_at is null and reviewed_by is null and review_note is null and ktp_path like auth.uid()::text || '/%');
create policy "affiliate admin select" on public.affiliate_applications for select to authenticated using (public.is_baylos_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('affiliate-ktp-private','affiliate-ktp-private',false,3145728,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=3145728,allowed_mime_types=excluded.allowed_mime_types;
create policy "affiliate ktp upload own" on storage.objects for insert to authenticated with check(bucket_id='affiliate-ktp-private' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "affiliate ktp admin read" on storage.objects for select to authenticated using(bucket_id='affiliate-ktp-private' and public.is_baylos_admin());
create or replace function public.baylos_review_affiliate(p_application_id uuid,p_status text,p_note text default '') returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_baylos_admin() then raise exception 'Not authorized'; end if;
 if p_status not in ('approved','rejected','needs_revision','suspended') then raise exception 'Invalid status'; end if;
 if p_status <> 'approved' and length(trim(p_note))=0 then raise exception 'Reason required'; end if;
 update public.affiliate_applications set status=p_status,reviewed_at=now(),reviewed_by=auth.uid(),review_note=left(p_note,1000) where id=p_application_id;
 if not found then raise exception 'Application not found'; end if;
end $$;
revoke all on function public.baylos_review_affiliate(uuid,text,text) from public,anon;
grant execute on function public.baylos_review_affiliate(uuid,text,text) to authenticated;
