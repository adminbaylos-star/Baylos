-- BAYLOS TAHAP 12: READ-ONLY AUDIT
-- Jalankan di Supabase SQL Editor. Script ini hanya SELECT; tidak mengubah data/schema.

-- 1) Tabel publik dan status RLS
SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- 2) Kebijakan RLS yang ada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3) Fungsi/RPC di schema public (nama dan signature saja)
SELECT n.nspname AS schema_name,
       p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 4) Kolom peran/status pada profiles (tanpa membaca data pengguna)
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5) Kolom sensitif terkait afiliasi/KTP/order yang mungkin sudah ada (metadata saja)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (table_name ILIKE '%affiliate%' OR table_name ILIKE '%application%' OR table_name IN ('orders','profiles'))
  AND (column_name ILIKE '%ktp%' OR column_name ILIKE '%identity%' OR column_name ILIKE '%document%'
       OR column_name ILIKE '%role%' OR column_name ILIKE '%status%' OR column_name ILIKE '%commission%'
       OR column_name ILIKE '%payment%' OR column_name ILIKE '%tracking%')
ORDER BY table_name, ordinal_position;
