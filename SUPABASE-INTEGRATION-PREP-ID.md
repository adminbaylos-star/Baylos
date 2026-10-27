# Baylos — Persiapan Integrasi Supabase

## Status penting
Paket ini adalah bahan persiapan, bukan bukti Baylos sudah terhubung ke Supabase. Tidak ada perubahan ke `main`. Operasi tulis GitHub ditolak dengan HTTP 403, jadi file belum diterapkan ke repo; paket ini bisa ditinjau dan ditambahkan manual ke branch pengembangan.

## Isi paket
- `supabase/schema-current-project.sql`: audit read-only untuk kolom, constraint/relasi, dan RLS.
- `supabase/functions/catalog/index.ts`: Edge Function GET untuk produk aktif dan harga reseller bagi profil approved.
- `supabase/functions/create-order/index.ts`: scaffold checkout fail-closed; belum menulis data.

## Langkah
1. Jalankan query kolom di Supabase Dashboard → proyek `baylos-s` → SQL Editor.
2. Jalankan query constraint dan RLS secara terpisah setelahnya.
3. Cocokkan nama kolom, tipe ID, PK/FK, nullability dan policies dengan kode.
4. Uji katalog dengan guest, customer, reseller pending, reseller approved, dan admin.
5. Implementasikan checkout transaksional/RPC setelah skema terverifikasi.

## Autentikasi dan harga reseller
Gunakan Supabase Auth, bukan login demo localStorage. Jangan izinkan browser mengubah `user_role` atau `reseller_status`; persetujuan reseller harus dilakukan lewat jalur admin yang dilindungi. RLS tetap wajib diuji.

## Checkout aman — belum aktif
Function `create-order` sengaja tidak melakukan write dan mengembalikan `409 SCHEMA_AUDIT_REQUIRED`. Ini mencegah asumsi tipe kolom dan mencegah checkout demo terlihat seperti transaksi nyata.

Implementasi final harus memvalidasi product ID/quantity, membaca harga dan stok dari database, memilih harga reseller berdasarkan status approved, menghitung total di server, serta membuat order/items dan reservasi stok secara atomik. Tambahkan idempotency key. Status pembayaran tidak boleh menjadi lunas sebelum webhook/callback provider terverifikasi.

## Rahasia
`SUPABASE_SERVICE_ROLE_KEY`, API key Biteship, dan secret payment gateway hanya boleh di Supabase Function Secrets/server. Jangan taruh di `index.html` atau repo publik.

## Pengujian
Belum diuji terhadap proyek Supabase nyata dan belum di-deploy. Tidak ada klaim compile/deploy/connected. Jangan aktifkan checkout live sebelum audit dan tes lulus.
